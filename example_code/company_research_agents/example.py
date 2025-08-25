#!/usr/bin/env python3
"""
Example usage of Company Research Agents

This script demonstrates how to use the company research system
to analyze a company website and extract structured data.

Run this script from your Django project root:
python agents_sdk/company_research_agents/example.py
"""

import os
import sys
import django
from pprint import pprint

# Setup Django environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'markmill.settings')
django.setup()

from django.contrib.auth.models import User
from agents_sdk.company_research_agents import research_company_sync


def main():
    """Example usage of the company research system"""
    
    # Create or get a test user
    user, created = User.objects.get_or_create(
        username='test_user',
        defaults={
            'email': 'test@example.com',
            'first_name': 'Test',
            'last_name': 'User'
        }
    )
    
    if created:
        print("✅ Created test user")
    else:
        print("📝 Using existing test user")
    
    # Example companies to research
    test_companies = [
        'https://www.acadrius.com'
    ]
    
    print("\n🔍 Starting Company Research Example\n")
    
    for i, url in enumerate(test_companies, 1):
        print(f"--- Example {i}: Researching {url} ---")
        
        try:
            # Research the company
            result = research_company_sync(
                url=url,
                user=user,
                max_pages=3  # Limit for faster testing
            )
            
            if result['success']:
                print(f"✅ Success! Company created with ID: {result['company_id']}")
                print(f"📊 Stats:")
                print(f"   - Products created: {result['products_created']}")
                print(f"   - Pages crawled: {result['pages_crawled']}")
                print(f"   - Crawl method: {result['crawl_method']}")
                
                # Show extracted company data
                company_data = result['company_data']
                print(f"🏢 Company Info:")
                print(f"   - Name: {company_data.name}")
                print(f"   - Industry: {company_data.industry}")
                print(f"   - Size: {company_data.size}")
                print(f"   - Description: {company_data.description[:100]}...")
                
                # Show product analysis
                product_analysis = result['product_analysis']
                print(f"🛍️  Product Analysis:")
                print(f"   - Analysis type: {product_analysis.analysis_type}")
                print(f"   - Business model: {product_analysis.business_model}")
                print(f"   - Products found: {product_analysis.total_products_found}")
                
                for j, product in enumerate(product_analysis.products, 1):
                    print(f"   - Product {j}: {product.name} ({product.category})")
                
            else:
                print(f"❌ Failed: {result['error']}")
            
        except Exception as e:
            print(f"💥 Exception: {str(e)}")
        
        print(f"   - Trace ID: {result.get('trace_id', 'N/A')}")
        print()
        
        # Stop after first success for demo
        if result.get('success'):
            print("🎉 Demo completed successfully!")
            break
    
    print("\n📋 You can now check the Django admin to see the created Company and Product records.")
    print("🔗 Or use the Django ORM:")
    print("   from main.models import Company, Product")
    print("   Company.objects.filter(user=user)")
    print("   Product.objects.filter(company__user=user)")


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n👋 Example stopped by user")
    except Exception as e:
        print(f"\n💥 Unexpected error: {str(e)}")
        import traceback
        traceback.print_exc() 