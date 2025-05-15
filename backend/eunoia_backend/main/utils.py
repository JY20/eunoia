import os
import openai
import requests
from bs4 import BeautifulSoup
from pydantic import BaseModel, Field
from typing import List, Optional, Tuple
from django.conf import settings
from .models import Charity # Assuming Charity model is in the same app's models.py
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

# --- Pydantic Models for OpenAI Structured Output ---

class CharityInfo(BaseModel):
    name: Optional[str] = Field(None, description="The official name of the charity.")
    summary: str = Field(..., description="A concise summary of the charity's main mission, goals, and activities.")
    activities: Optional[List[str]] = Field(None, description="A list of key activities the charity engages in.")
    keywords: Optional[List[str]] = Field(None, description="A list of keywords that best describe the charity's focus.")

class EnhancedQuery(BaseModel):
    enhanced_query: str = Field(..., description="The user query, enhanced for better semantic search results.")
    keywords: Optional[List[str]] = Field(None, description="Keywords extracted or inferred from the query to aid search.")

# --- OpenAI Client Initialization ---

try:
    openai.api_key = os.getenv("OPENAI_API_KEY")
    if not openai.api_key:
        # Fallback for Django settings if OPENAI_API_KEY is not in environment
        # Ensure OPENAI_API_KEY is defined in your Django settings.py
        openai.api_key = settings.OPENAI_API_KEY 
    
    if not openai.api_key:
        raise ValueError("OPENAI_API_KEY not found in environment variables or Django settings.")
    
    client = openai.OpenAI(api_key=openai.api_key)

except AttributeError:
    # If settings.OPENAI_API_KEY is not defined
    raise ValueError("OPENAI_API_KEY not found in environment variables, and settings.OPENAI_API_KEY is not configured in Django settings.")
except Exception as e:
    print(f"Error initializing OpenAI client: {e}")
    client = None


# --- Core Functions ---

def get_embedding(text: str, model="text-embedding-ada-002") -> Optional[List[float]]:
    """Generates an embedding for the given text using OpenAI."""
    if not client or not text:
        return None
    try:
        text = text.replace("\n", " ")
        response = client.embeddings.create(input=[text], model=model)
        return response.data[0].embedding
    except Exception as e:
        print(f"Error getting embedding: {e}")
        return None

async def process_charity_website(charity: Charity) -> None:
    """
    Fetches content from charity's website, processes it with OpenAI,
    updates the charity's description and embedding.
    Saves the raw extracted text.
    """
    if not client or not charity.website_url:
        print(f"Skipping processing for {charity.name}: OpenAI client not initialized or no website URL.")
        return

    try:
        response = requests.get(charity.website_url, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Extract text - a more robust extraction might be needed for complex sites
        paragraphs = soup.find_all('p')
        extracted_text = "\n".join([p.get_text() for p in paragraphs if p.get_text().strip()])
        
        charity.extracted_text_data = extracted_text if extracted_text else "Could not extract text."

        if not extracted_text:
            print(f"No text extracted from {charity.website_url}")
            charity.description = "Automated description generation failed: No text found on website."
            charity.embedding = None
            await charity.asave() # Use asave for async context if applicable
            return

        # Summarize and extract info using OpenAI
        prompt_text = f"Extract and summarize the key information about the charity from the following text. Focus on their mission, main activities, and what they aim to achieve. Limit the summary to 2-3 concise paragraphs.\n\nWebsite Text:\n{extracted_text[:4000]}" # Limit input size
        
        completion = await client.chat.completions.create(
            model="gpt-4o", # Or your preferred model like gpt-3.5-turbo
            messages=[
                {"role": "system", "content": "You are a helpful assistant designed to extract information about charities and structure it in JSON format according to the provided schema."},
                {"role": "user", "content": prompt_text}
            ],
            response_model=CharityInfo, # For structured output
            temperature=0.2,
        )
        
        # If using response_model with a compatible library version:
        charity_info: CharityInfo = completion 
        
        if charity_info and charity_info.summary:
            charity.description = charity_info.summary # Update charity's description
            charity.embedding = get_embedding(charity.description)
        else:
            charity.description = "Automated description generation failed."
            charity.embedding = None
            print(f"Failed to generate structured summary for {charity.name}")
            
        await charity.asave() # Use asave for async context 
        print(f"Successfully processed and updated {charity.name}")

    except requests.RequestException as e:
        print(f"Error fetching website for {charity.name}: {e}")
        charity.extracted_text_data = f"Failed to fetch website: {e}"
        charity.description = "Automated description generation failed: Could not reach website."
        charity.embedding = None
        await charity.asave()
    except Exception as e:
        print(f"Error processing charity {charity.name}: {e}")
        # Potentially save partial data or error state
        charity.description = f"Automated description generation failed: {e}"
        charity.embedding = None
        await charity.asave()


async def enhance_query_and_search(user_query: str, top_k: int = 5) -> List[Charity]:
    """
    Enhances the user query using an LLM, embeds it,
    and performs semantic search against charities.
    """
    if not client:
        print("OpenAI client not initialized. Cannot perform search.")
        return []

    try:
        # Enhance query using OpenAI
        prompt = f"Enhance the following user query to make it more effective for semantic search in a database of charities. Focus on keywords and the underlying intent. Return the enhanced query.\n\nUser Query: '{user_query}'"
        
        enhanced_query_completion = await client.chat.completions.create(
            model="gpt-4o", # Or your preferred model
            messages=[
                {"role": "system", "content": "You are an expert query enhancer. Your goal is to refine user queries for better semantic search against a charity database. Respond with the structured EnhancedQuery format."},
                {"role": "user", "content": prompt}
            ],
            response_model=EnhancedQuery,
            temperature=0.1,
        )
        
        # If using response_model with a compatible library version:
        enhanced_query_data: EnhancedQuery = enhanced_query_completion
        search_query_text = enhanced_query_data.enhanced_query
        
        print(f"Original query: '{user_query}', Enhanced query: '{search_query_text}'")

        query_embedding = get_embedding(search_query_text)
        if not query_embedding:
            print("Failed to embed enhanced query.")
            return []

        # Fetch all charities with embeddings (consider batching for large datasets)
        # Ensure charities are accessed in an async-friendly way if this function is async
        charities_with_embeddings = []
        async for charity in Charity.objects.filter(embedding__isnull=False):
             charities_with_embeddings.append(charity)
        
        if not charities_with_embeddings:
            print("No charities with embeddings found in the database.")
            return []

        charity_embeddings = np.array([charity.embedding for charity in charities_with_embeddings])
        query_embedding_np = np.array(query_embedding).reshape(1, -1)

        # Calculate cosine similarities
        similarities = cosine_similarity(query_embedding_np, charity_embeddings)[0]
        
        # Get top K results
        # Argsort returns indices from smallest to largest, so we take the last top_k and reverse
        top_k_indices = np.argsort(similarities)[-top_k:][::-1] 
        
        results = [charities_with_embeddings[i] for i in top_k_indices if similarities[i] > 0.75] # Optional: add a similarity threshold
        
        print(f"Found {len(results)} charities for query '{search_query_text}'.")
        return results

    except Exception as e:
        print(f"Error during semantic search for query '{user_query}': {e}")
        return []

# --- Django Signals or Model Save Override ---
# This is where you'd hook `process_charity_website` into the Charity model's save lifecycle.
# For example, using a post_save signal:

from django.db.models.signals import post_save
from django.dispatch import receiver
import asyncio

@receiver(post_save, sender=Charity)
def charity_post_save_receiver(sender, instance, created, **kwargs):
    """
    After a Charity is saved, if it's newly created or website_url changed,
    process its website to extract data, update description, and generate embedding.
    """
    # Avoid recursion if process_charity_website itself saves the instance.
    # A common way is to check for specific field changes if not 'created'.
    # However, for simplicity, let's assume process_charity_website handles its save well.
    # or check if it's a raw save (e.g. from loaddata)
    if kwargs.get('raw', False):
        return

    # We need to run the async function in a synchronous signal handler.
    # Best practice is to offload this to a background task queue (e.g., Celery).
    # For simplicity here, we'll use asyncio.run(), but be aware of potential blocking in a sync context.
    
    # Check if this is a new instance or if website_url has changed.
    # This basic check might need refinement depending on how you want to trigger reprocessing.
    # For example, if you want to reprocess only if 'website_url' has changed.
    # One way to check for field changes is to compare current instance with one from DB before save.
    # But post_save doesn't give old values easily.
    
    # Simplistic trigger: always run on create, or if website_url is present and perhaps embedding is missing.
    trigger_processing = False
    if created:
        trigger_processing = True
    else:
        # Logic to determine if re-processing is needed on update.
        # e.g., if embedding is None and website_url exists
        if instance.website_url and not instance.embedding:
            trigger_processing = True
        # Add more conditions if needed, e.g., re-process if website_url changed.
        # This requires comparing with the old value, often done by storing it temporarily
        # or using a library like django-dirtyfields.

    if instance.website_url and trigger_processing:
        print(f"Signal triggered for Charity ID: {instance.id}. Processing website...")
        # Running async code from sync signal handler
        # In a production environment, use Celery or Django Q for background tasks.
        try:
            # Create a new event loop if not running in an async context already
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            loop.run_until_complete(process_charity_website(instance))
        except RuntimeError as e:
            # Handle cases where an event loop is already running (e.g., in Jupyter/async server)
            if "cannot be called when another loop is running" in str(e):
                asyncio.ensure_future(process_charity_website(instance))
            else:
                raise e
        print(f"Website processing initiated for {instance.name}")

    elif not instance.website_url:
        print(f"Skipping website processing for {instance.name} as no website URL is provided.")
