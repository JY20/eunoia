import os
import django
import asyncio
import pprint
import sys

# Add project root to sys.path to allow Django to find the 'markmill' module
project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, project_root)

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'markmill.settings')
django.setup()

from django.contrib.auth.models import User
from asgiref.sync import sync_to_async

# Defer import of the manager to avoid import-time errors
# from agents_sdk.company_research_agents.manager import CompanyResearchManager

async def main():
    """
    Runs the full company research manager and prints the results.
    """
    # Import the manager here, inside the async function
    from agents_sdk.company_research_agents.manager import CompanyResearchManager

    test_url = "https://www.acadrius.com"
    print(f"--- Starting Manager Test for: {test_url} ---")
    
    try:
        # Get or create a test user
        user, created = await sync_to_async(User.objects.get_or_create)(
            username='test_research_user',
            defaults={'first_name': 'Test', 'last_name': 'User'}
        )
        if created:
            print("Created a new test user: 'test_research_user'")
        else:
            print("Using existing test user: 'test_research_user'")

        # Instantiate and run the manager
        manager = CompanyResearchManager()
        # Set a higher max_pages for a more thorough test
        result = await manager.research_company(url=test_url, user=user, max_pages=10)
        
        print("\n--- Manager Finished ---")
        print("Result:")
        
        # Pretty-print the result, converting Pydantic models to dicts for clean output
        if result.get('company_data'):
            result['company_data'] = result['company_data'].dict()
        if result.get('product_analysis'):
            result['product_analysis'] = result['product_analysis'].dict()
            
        pprint.pprint(result)

    except Exception as e:
        print(f"\n--- An error occurred ---")
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    # Note: This process can take a few minutes depending on the website
    # and AI model response times.
    asyncio.run(main()) 