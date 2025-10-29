import os
import openai
import requests
import json # Import json for parsing
from bs4 import BeautifulSoup
from pydantic import BaseModel, Field, ValidationError
from typing import List, Optional
from django.conf import settings
from .models import Charity # Assuming Charity model is in the same app's models.py
from django.db.models import Q
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from django.db.models.signals import post_save
from django.dispatch import receiver

# --- Pydantic Models for OpenAI Structured Output ---

# Get CharityCategory choices for the Pydantic model description
charity_category_choices_str = ", ".join([f"'{code}' ({label})" for code, label in Charity.CharityCategory.choices])

class CharityInfo(BaseModel):
    name: Optional[str] = Field(None, description="The official name of the charity.")
    summary: str = Field(..., description="A concise summary of the charity's main mission, goals, and activities. Should be 2-3 paragraphs.")
    activities: Optional[List[str]] = Field(None, description="A list of key activities or programs the charity engages in.")
    keywords: Optional[List[str]] = Field(None, description="A list of 5-7 relevant keywords that best describe the charity's focus and services.")
    category: Optional[str] = Field(None, description=f"The most fitting category for the charity. Choose one code from: {charity_category_choices_str}. If none fit well, use 'OTH'.")
    tagline: Optional[str] = Field(None, description="A short, catchy, and representative tagline for the charity (max 15 words). Example: 'Empowering youth through education.'")

class EnhancedQuery(BaseModel):
    enhanced_query: str = Field(..., description="The user query, enhanced for better semantic search results.")
    keywords: Optional[List[str]] = Field(None, description="Keywords extracted or inferred from the query to aid search.")

# New Pydantic model for the combined mission statement
class CombinedCharityMission(BaseModel):
    resonating_statement: str = Field(..., description="A single, concise statement (1-2 sentences) summarizing the common themes, missions, or goals of the provided charities, especially in relation to the user's query.")
    # contributing_charity_names: Optional[List[str]] = Field(None, description="Names of the charities that most contributed to this combined statement.")

# --- OpenAI Client Initialization ---

try:
    openai.api_key = os.getenv("OPENAI_API_KEY")
    if not openai.api_key and hasattr(settings, 'OPENAI_API_KEY'):
        openai.api_key = settings.OPENAI_API_KEY
    
    if not openai.api_key:
        raise ValueError("OPENAI_API_KEY not found in environment variables or Django settings.")
    
    client = openai.OpenAI(api_key=openai.api_key)

except Exception as e:
    print(f"Error initializing OpenAI client: {e}")
    client = None


# --- Core Functions (Synchronous) ---

def get_embedding(text: str, model="text-embedding-3-small") -> Optional[List[float]]:
    if not client or not text:
        return None
    try:
        text = text.replace("\n", " ")
        response = client.embeddings.create(input=[text], model=model)
        return response.data[0].embedding
    except Exception as e:
        print(f"Error getting embedding for text '{text[:100]}...': {e}")
        return None

def process_charity_website(charity: Charity) -> None:
    if not client or not charity.website_url:
        print(f"Skipping processing for {charity.name}: OpenAI client not initialized or no website URL.")
        if not charity.description: # Ensure description is not empty if processing fails early
             charity.description = "Automated data extraction skipped: No website URL or OpenAI client issue."
        # Ensure other AI-populated fields are also handled if they were meant to be blank
        charity.tagline = charity.tagline or ""
        charity.keywords = charity.keywords or []
        charity.category = charity.category or Charity.CharityCategory.OTHER
        charity.save()
        return

    print(f"Processing website for {charity.name} ({charity.website_url})...")
    try:
        response = requests.get(charity.website_url, timeout=15) # Increased timeout
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        
        paragraphs = soup.find_all('p')
        extracted_text = "\n".join([p.get_text(separator=' ', strip=True) for p in paragraphs if p.get_text(strip=True)])
        
        charity.extracted_text_data = extracted_text if extracted_text else "Could not extract text."

        if not extracted_text:
            print(f"No text extracted from {charity.website_url}")
            charity.description = "Automated data extraction failed: No text found on website."
            charity.tagline = ""
            charity.keywords = []
            charity.category = Charity.CharityCategory.OTHER
            charity.embedding = None
            charity.save()
            return

        charity_info_tool = {
            "type": "function",
            "name": "extract_charity_information",
            "description": "Extracts and structures information about a charity including summary, keywords, category, and tagline from website text.",
            "parameters": CharityInfo.model_json_schema()
        }
        
        prompt_text = (
            f"From the following website text of a charity, please perform these actions:\n"
            f"1. Write a concise summary (2-3 paragraphs) of its main mission, goals, and key activities.\n"
            f"2. Generate a short, catchy tagline (max 15 words).\n"
            f"3. Identify the most fitting category for the charity. Choose one code from: {charity_category_choices_str}. If none fit well, use 'OTH'.\n"
            f"4. List 5-7 relevant keywords that best describe the charity.\n"
            f"Ensure all information is based *only* on the provided text.\n\n"
            f"Website Text:\n{extracted_text[:8000]}"
        )
        
        print(f"Sending text to OpenAI for structured extraction (length: {len(prompt_text)} chars)...")
        response = client.responses.create(
            model="gpt-5",
            instructions="You are an expert assistant skilled in analyzing charity websites and extracting structured information according to the provided tool. Provide all requested fields: summary, tagline, category, and keywords.",
            input=prompt_text,
            tools=[charity_info_tool],
            tool_choice={"type": "function", "name": "extract_charity_information"},
        )
        
        # Find the function call in the response output
        # Items can be objects (with attributes) or dicts
        function_call_item = None
        for item in response.output:
            # Handle both object attributes and dict keys
            if isinstance(item, dict):
                item_type = item.get('type')
                item_name = item.get('name')
            else:
                item_type = getattr(item, 'type', None)
                item_name = getattr(item, 'name', None)
            
            if item_type == 'function_call' and item_name == 'extract_charity_information':
                function_call_item = item
                break
        
        if function_call_item:
            # Get arguments - handle both object and dict
            if hasattr(function_call_item, 'arguments'):
                arguments_raw = function_call_item.arguments
            elif isinstance(function_call_item, dict):
                arguments_raw = function_call_item.get('arguments', {})
            else:
                arguments_raw = {}
            
            # Convert to JSON string if it's a dict/object
            if isinstance(arguments_raw, (dict, str)):
                arguments_json = json.dumps(arguments_raw) if isinstance(arguments_raw, dict) else arguments_raw
            else:
                arguments_json = json.dumps(arguments_raw) if arguments_raw else '{}'
            
            print(f"Received arguments from OpenAI: {arguments_json}")
            try:
                charity_info = CharityInfo.model_validate_json(arguments_json)
                
                charity.description = charity_info.summary if charity_info.summary else "Summary not generated."
                charity.tagline = charity_info.tagline if charity_info.tagline else "Tagline not generated."
                charity.keywords = charity_info.keywords if charity_info.keywords else []
                
                if charity_info.category and charity_info.category in [code for code, label in Charity.CharityCategory.choices]:
                    charity.category = charity_info.category
                else:
                    print(f"Invalid or missing category from OpenAI ('{charity_info.category}'), defaulting to OTH for {charity.name}.")
                    charity.category = Charity.CharityCategory.OTHER
                
                print(f"Extracted for {charity.name}: Summary - '{charity.description[:50]}...', Tagline - '{charity.tagline}', Category - '{charity.category}', Keywords - {charity.keywords}")
                
                if charity.description and charity.description != "Summary not generated.":
                    charity.embedding = get_embedding(charity.description + " " + (charity.tagline or "") + " " + " ".join(charity.keywords or []))
                    if charity.embedding:
                        print(f"Generated embedding for {charity.name}")
                    else:
                        print(f"Failed to generate embedding for {charity.name}")
                        charity.embedding = None # Ensure it's null if failed
                else:
                    charity.embedding = None

            except ValidationError as e:
                print(f"Pydantic validation error for {charity.name}: {e}. Raw args: {arguments_json}")
                charity.description = charity.description or "Automated data extraction failed: OpenAI output validation error."
                charity.tagline = charity.tagline or ""
                charity.keywords = charity.keywords or []
                charity.category = charity.category or Charity.CharityCategory.OTHER
                charity.embedding = None
            except json.JSONDecodeError as e:
                print(f"JSON decode error for {charity.name}: {e}. Raw args: {arguments_json}")
                charity.description = charity.description or "Automated data extraction failed: OpenAI output JSON decode error."
                charity.tagline = charity.tagline or ""
                charity.keywords = charity.keywords or []
                charity.category = charity.category or Charity.CharityCategory.OTHER
                charity.embedding = None
        else:
            print(f"OpenAI did not use the tool for {charity.name}. Populating with defaults.")
            charity.description = charity.description or "Automated data extraction failed: No tool call from OpenAI."
            charity.tagline = charity.tagline or ""
            charity.keywords = charity.keywords or []
            charity.category = charity.category or Charity.CharityCategory.OTHER
            charity.embedding = None
            
        charity.save()
        print(f"Successfully processed and saved {charity.name}")

    except requests.RequestException as e:
        print(f"Error fetching website for {charity.name}: {e}")
        charity.extracted_text_data = charity.extracted_text_data or f"Failed to fetch website: {e}"
        charity.description = charity.description or "Automated data extraction failed: Could not reach website."
        charity.tagline = charity.tagline or ""
        charity.keywords = charity.keywords or []
        charity.category = charity.category or Charity.CharityCategory.OTHER
        charity.embedding = None
        charity.save()
    except openai.APIError as e:
        print(f"OpenAI API error processing charity {charity.name}: {e}")
        charity.description = charity.description or f"Automated data extraction failed: OpenAI API Error - {type(e).__name__}."
        charity.tagline = charity.tagline or ""
        charity.keywords = charity.keywords or []
        charity.category = charity.category or Charity.CharityCategory.OTHER
        charity.embedding = None
        charity.save()
    except Exception as e:
        print(f"General error processing charity {charity.name}: {e} (Type: {type(e).__name__})")
        charity.description = charity.description or f"Automated data extraction failed: An unexpected error occurred - {type(e).__name__}."
        charity.tagline = charity.tagline or ""
        charity.keywords = charity.keywords or []
        charity.category = charity.category or Charity.CharityCategory.OTHER
        charity.embedding = None
        charity.save()

def generate_combined_mission_statement(user_query: str, charities_data: List[dict]) -> Optional[CombinedCharityMission]:
    if not client or not charities_data:
        print("OpenAI client not initialized or no charities data provided for combined mission.")
        return None

    charity_details_prompt_segment = "\n\nProvided Charities Information:\n"
    for i, charity_data in enumerate(charities_data[:3]): # Limit to top 3-5 for brevity in prompt
        charity_details_prompt_segment += f"{i+1}. Name: {charity_data.get('name', 'N/A')}\n   Description: {charity_data.get('description', 'N/A')[:200]}...\n"

    prompt_text = (
        f"Given the user's interest expressed as: '{user_query}', "
        f"and considering the following charities that were matched: {charity_details_prompt_segment}"
        f"Please generate a single, concise, and inspiring statement (1-2 sentences, max 40 words) that reflects the shared mission, common goals, or the collective impact these charities represent in addressing the user's interest. "
        f"This statement should resonate with the user's desire to make a difference in the identified area."
    )

    combined_mission_tool = {
        "type": "function",
        "name": "extract_combined_charity_mission",
        "description": "Extracts a combined, resonating mission statement for a list of charities based on user query.",
        "parameters": CombinedCharityMission.model_json_schema()
    }

    try:
        print(f"Sending prompt to OpenAI for combined mission statement (query: '{user_query}', num_charities: {len(charities_data)})...")
        response = client.responses.create(
            model="gpt-5",
            instructions="You are an expert assistant skilled in synthesizing information about multiple charities and a user query into a single, impactful mission statement. Respond using the provided tool.",
            input=prompt_text,
            tools=[combined_mission_tool],
            tool_choice={"type": "function", "name": "extract_combined_charity_mission"},
        )

        # Find the function call in the response output
        # Items can be objects (with attributes) or dicts
        function_call_item = None
        for item in response.output:
            # Handle both object attributes and dict keys
            if isinstance(item, dict):
                item_type = item.get('type')
                item_name = item.get('name')
            else:
                item_type = getattr(item, 'type', None)
                item_name = getattr(item, 'name', None)
            
            if item_type == 'function_call' and item_name == 'extract_combined_charity_mission':
                function_call_item = item
                break
        
        if function_call_item:
            # Get arguments - handle both object and dict
            if hasattr(function_call_item, 'arguments'):
                arguments_raw = function_call_item.arguments
            elif isinstance(function_call_item, dict):
                arguments_raw = function_call_item.get('arguments', {})
            else:
                arguments_raw = {}
            
            # Convert to JSON string if it's a dict/object
            if isinstance(arguments_raw, (dict, str)):
                arguments_json = json.dumps(arguments_raw) if isinstance(arguments_raw, dict) else arguments_raw
            else:
                arguments_json = json.dumps(arguments_raw) if arguments_raw else '{}'
            
            print(f"Received combined mission arguments from OpenAI: {arguments_json}")
            try:
                combined_mission_info = CombinedCharityMission.model_validate_json(arguments_json)
                return combined_mission_info
            except ValidationError as e:
                print(f"Pydantic validation error for combined mission: {e}. Raw args: {arguments_json}")
                return CombinedCharityMission(resonating_statement="Our AI is analyzing the collective impact of these charities for you.") # Fallback
            except json.JSONDecodeError as e:
                print(f"JSON decode error for combined mission: {e}. Raw args: {arguments_json}")
                return CombinedCharityMission(resonating_statement="Our AI is analyzing the collective impact of these charities for you.") # Fallback
        else:
            print("OpenAI did not use the tool for combined mission statement.")
            return CombinedCharityMission(resonating_statement="These charities align with your vision for change.") # Generic fallback

    except openai.APIError as e:
        print(f"OpenAI API error generating combined mission statement: {e}")
        return None
    except Exception as e:
        print(f"General error generating combined mission statement: {e} (Type: {type(e).__name__})")
        return None

def enhance_query_and_search(user_query: str, top_k: int = 5) -> List[Charity]:
    def fallback_charity_search(q: str, limit: int = 6) -> List[Charity]:
        try:
            base_qs = Charity.objects.all()
            if q and q.strip():
                naive_qs = base_qs.filter(
                    Q(name__icontains=q) |
                    Q(description__icontains=q) |
                    Q(tagline__icontains=q)
                ).order_by('-is_verified', '-date_registered')
                results = list(naive_qs[:limit])
                if results:
                    print(f"Fallback search returned {len(results)} charities for query '{q}'.")
                    return results
            # As a last resort, return some verified or recent charities
            verified_qs = base_qs.filter(is_verified=True).order_by('-date_registered')
            results = list(verified_qs[:limit]) if verified_qs.exists() else list(base_qs.order_by('-date_registered')[:limit])
            print(f"Fallback default returned {len(results)} charities.")
            return results
        except Exception as e:
            print(f"Fallback search error: {e}")
            return []

    if not client:
        print("OpenAI client not initialized. Using fallback search.")
        return fallback_charity_search(user_query)

    try:
        enhanced_query_tool = {
            "type": "function",
            "name": "enhance_user_query",
            "description": "Enhances a user query for better semantic search in a charity database.",
            "parameters": EnhancedQuery.model_json_schema() # Pydantic v2 method
        }
        prompt = f"Enhance the following user query to make it more effective for semantic search in a database of charities. Focus on keywords and the underlying intent. Return the enhanced query.\n\nUser Query: '{user_query}'"
        
        response = client.responses.create(
            model="gpt-5",
            instructions="You are an expert query enhancer. Your goal is to refine user queries for better semantic search against a charity database. Respond using the provided tool.",
            input=prompt,
            tools=[enhanced_query_tool],
            tool_choice={"type": "function", "name": "enhance_user_query"},
        )
        
        search_query_text = user_query # Default to original query
        
        # Find the function call in the response output
        # Items can be objects (with attributes) or dicts
        function_call_item = None
        for item in response.output:
            # Handle both object attributes and dict keys
            if isinstance(item, dict):
                item_type = item.get('type')
                item_name = item.get('name')
            else:
                item_type = getattr(item, 'type', None)
                item_name = getattr(item, 'name', None)
            
            if item_type == 'function_call' and item_name == 'enhance_user_query':
                function_call_item = item
                break
        
        if function_call_item:
            # Get arguments - handle both object and dict
            if hasattr(function_call_item, 'arguments'):
                arguments_raw = function_call_item.arguments
            elif isinstance(function_call_item, dict):
                arguments_raw = function_call_item.get('arguments', {})
            else:
                arguments_raw = {}
            
            # Convert to JSON string if it's a dict/object
            if isinstance(arguments_raw, (dict, str)):
                arguments_json = json.dumps(arguments_raw) if isinstance(arguments_raw, dict) else arguments_raw
            else:
                arguments_json = json.dumps(arguments_raw) if arguments_raw else '{}'
            
            try:
                enhanced_query_data = EnhancedQuery.model_validate_json(arguments_json) # Pydantic v2 method
                search_query_text = enhanced_query_data.enhanced_query
                print(f"Original query: '{user_query}', Enhanced query: '{search_query_text}'")
            except ValidationError as e:
                print(f"Pydantic validation error for enhanced query: {e}. Using original query.")
            except json.JSONDecodeError as e:
                print(f"JSON decode error for enhanced query: {e}. Using original query.")
        else:
            print("OpenAI did not use the tool for query enhancement. Using original query.")


        query_embedding = get_embedding(search_query_text)
        if not query_embedding:
            print(f"Failed to embed query: '{search_query_text}'. Using fallback search.")
            return fallback_charity_search(user_query)

        charities_with_embeddings = Charity.objects.filter(embedding__isnull=False).exclude(embedding__exact=[]) # Exclude empty lists
        
        if not charities_with_embeddings.exists():
            print("No charities with embeddings found in the database. Using fallback search.")
            return fallback_charity_search(user_query)

        # Filter out charities with invalid or missing embeddings before creating numpy array
        valid_charities = []
        all_charity_embeddings_list = []
        for charity in charities_with_embeddings:
            if charity.embedding and isinstance(charity.embedding, list) and len(charity.embedding) > 0:
                 # Assuming embedding is a list of floats. Add further validation if needed.
                is_valid_embedding = all(isinstance(val, (int, float)) for val in charity.embedding)
                if is_valid_embedding:
                    valid_charities.append(charity)
                    all_charity_embeddings_list.append(charity.embedding)
                else:
                    print(f"Skipping charity {charity.name} due to invalid embedding content: {charity.embedding}")
            else:
                print(f"Skipping charity {charity.name} due to missing or invalid embedding: {charity.embedding}")
        
        if not valid_charities:
            print("No charities with valid embeddings available for search. Using fallback search.")
            return fallback_charity_search(user_query)

        charity_embeddings_np = np.array(all_charity_embeddings_list)
        query_embedding_np = np.array(query_embedding).reshape(1, -1)

        similarities = cosine_similarity(query_embedding_np, charity_embeddings_np)[0]
        
        # Add similarity scores to charities for potential sorting/filtering
        # charities_with_scores = []
        # for i, charity in enumerate(valid_charities):
        #     charities_with_scores.append({"charity": charity, "score": similarities[i]})
        
        # Sort by score and get top K
        # sorted_charities = sorted(charities_with_scores, key=lambda x: x["score"], reverse=True)
        # top_k_results = [item["charity"] for item in sorted_charities[:top_k] if item["score"] > 0.75] # Optional threshold

        # More direct way with argsort
        # Ensure we only consider indices for valid_charities
        num_valid_charities = len(valid_charities)
        if num_valid_charities == 0 : return []

        # Argsort returns indices from smallest to largest similarity
        # We need to handle cases where top_k might be larger than num_valid_charities
        actual_top_k = min(top_k, num_valid_charities)
        top_k_indices = np.argsort(similarities)[-actual_top_k:][::-1]

        results = []
        similarity_threshold = 0.5 # Slightly relaxed threshold
        for i in top_k_indices:
            if i < len(valid_charities) and similarities[i] >= similarity_threshold: # Check index bounds and threshold
                results.append(valid_charities[i])
            # else: # Optional: log why a potential top-k was skipped
                # print(f"Skipping charity {valid_charities[i].name if i < len(valid_charities) else 'N/A'} with similarity {similarities[i] if i < len(similarities) else 'N/A'}")

        print(f"Found {len(results)} charities for query '{search_query_text}' (threshold: {similarity_threshold}).")
        if not results:
            print("Semantic search yielded 0 results. Using fallback search.")
            return fallback_charity_search(user_query)
        return results

    except openai.APIError as e:
        print(f"OpenAI API error during semantic search for query '{user_query}': {e}")
        return fallback_charity_search(user_query)
    except Exception as e:
        print(f"General error during semantic search for query '{user_query}': {e} (Type: {type(e).__name__})")
        return fallback_charity_search(user_query)

# --- Django Signals ---
@receiver(post_save, sender=Charity)
def charity_post_save_receiver(sender, instance: Charity, created: bool, **kwargs):
    if kwargs.get('raw', False): # Skip for fixtures
        return

    trigger_processing = False
    if created and instance.website_url:
        print(f"New charity '{instance.name}' created with website. Queuing for processing.")
        trigger_processing = True
    elif instance.website_url and not instance.extracted_text_data and not instance.description: # If website exists but no processing done
        print(f"Charity '{instance.name}' updated with website and no prior processing. Queuing.")
        trigger_processing = True
    # Add other conditions if needed, e.g., reprocess if website_url changes and user requests re-sync.
    # Be careful with signals that re-save the instance to avoid infinite loops.
    # `process_charity_website` now saves the instance itself.

    if trigger_processing:
        print(f"Signal triggered processing for Charity ID: {instance.id} ({instance.name}). Calling process_charity_website directly.")
        try:
            process_charity_website(instance) # Direct synchronous call
            print(f"Website processing finished for {instance.name}")
        except Exception as e:
            # This is a safeguard; process_charity_website should handle its own errors.
            print(f"Error in signal calling process_charity_website for {instance.name}: {e}")
    elif not instance.website_url:
        print(f"Skipping website processing for '{instance.name}'; no website URL provided or trigger conditions not met.")
