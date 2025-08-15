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

from agents_sdk.company_research_agents.utils import smart_website_crawler

async def main():
    """
    Runs the website crawler for a given URL and prints the results.
    """
    test_url = "https://www.acadrius.com"
    print(f"--- Starting Crawler Test for: {test_url} ---")
    
    try:
        # Run the crawler
        crawled_data = await smart_website_crawler(test_url, max_pages=5)
        
        print("\n--- Crawler Finished ---")
        print("Result:")
        pprint.pprint(crawled_data.dict())
        
    except Exception as e:
        print(f"\n--- An error occurred ---")
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main()) 