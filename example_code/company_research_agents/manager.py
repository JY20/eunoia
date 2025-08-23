from __future__ import annotations

import asyncio
import logging
from typing import Dict, Any, Optional
from asgiref.sync import sync_to_async
from django.contrib.auth.models import User

from agents import Runner, custom_span, gen_trace_id, trace, set_tracing_disabled
set_tracing_disabled(True)

from .utils import smart_website_crawler, CrawledWebsiteData
from .company_analysis_agent import company_analysis_agent, CompanyData
from .product_finder_agent import product_finder_agent, ProductAnalysisResult

logger = logging.getLogger(__name__)

class CompanyResearchManager:
    """
    Orchestrates the complete company research flow:
    1. Website crawling and content extraction
    2. Company data analysis and extraction
    3. Product/service identification
    4. Database storage
    """

    def __init__(self):
        pass

    async def research_company(self, url: str, user: User, max_pages: int = 5) -> Dict[str, Any]:
        """
        Research a company from their website URL and save to database.
        
        Args:
            url: Company website URL
            user: Django User instance to associate the company with
            max_pages: Maximum number of pages to crawl
            
        Returns:
            Dict containing research results and processing metadata
        """
        trace_id = gen_trace_id()
        
        with trace("Company research trace", trace_id=trace_id):
            logger.info(f"Starting company research for URL: {url}")
            
            try:
                # Step 1: Crawl the website
                crawled_data = await self._crawl_website(url, max_pages)
                
                if not crawled_data.pages:
                    return {
                        'success': False,
                        'error': 'Failed to crawl website or no content found',
                        'trace_id': trace_id,
                    }
                
                # Step 2: Analyze company data
                company_data = await self._analyze_company_data(crawled_data)
                
                # Step 3: Find products/services
                product_analysis = await self._analyze_products(crawled_data, company_data)
                
                # Step 4: Save to database
                saved_company, saved_products = await self._save_to_database(
                    user, company_data, product_analysis, crawled_data
                )
                
                return {
                    'success': True,
                    'company_id': saved_company.id,
                    'products_created': len(saved_products),
                    'pages_crawled': crawled_data.total_pages_crawled,
                    'crawl_method': crawled_data.crawl_method,
                    'company_data': company_data,
                    'product_analysis': product_analysis,
                    'trace_id': trace_id,
                }
                
            except Exception as e:
                logger.error(f"Error in company research for {url}: {str(e)}")
                return {
                    'success': False,
                    'error': str(e),
                    'trace_id': trace_id,
                }

    async def _crawl_website(self, url: str, max_pages: int) -> CrawledWebsiteData:
        """Step 1: Crawl the company website"""
        with custom_span("Crawl website"):
            logger.info(f"Crawling website: {url}")
            return await smart_website_crawler(url, max_pages)

    async def _analyze_company_data(self, crawled_data: CrawledWebsiteData) -> CompanyData:
        """Step 2: Analyze crawled data to extract company information"""
        with custom_span("Analyze company data"):
            logger.info("Analyzing company data from crawled content")
            
            # Prepare input data for the agent
            input_data = self._prepare_company_analysis_input(crawled_data)
            logger.info(f"Input data: {input_data}")
            result = await Runner.run(company_analysis_agent, input_data)
            return result.final_output_as(CompanyData)

    async def _analyze_products(self, crawled_data: CrawledWebsiteData, company_data: CompanyData) -> ProductAnalysisResult:
        """Step 3: Analyze company data to identify products and services"""
        with custom_span("Analyze products"):
            logger.info("Analyzing products and services")
            
            # Prepare input data for the product finder agent
            input_data = self._prepare_product_analysis_input(crawled_data, company_data)
            
            result = await Runner.run(product_finder_agent, input_data)
            return result.final_output_as(ProductAnalysisResult)

    async def _save_to_database(
        self, 
        user: User, 
        company_data: CompanyData, 
        product_analysis: ProductAnalysisResult,
        crawled_data: CrawledWebsiteData
    ) -> tuple:
        """Step 4: Save company and product data to database"""
        with custom_span("Save to database"):
            logger.info("Saving company and product data to database")
            
            # Import models inside function to avoid circular imports
            from main.models import Company, Product, SocialMediaAccount
            
            # Create or update company
            company = await sync_to_async(self._create_or_update_company)(
                user, company_data, crawled_data
            )
            
            # Create products
            products = []
            for product_data in product_analysis.products:
                product = await sync_to_async(self._create_product)(company, product_data)
                products.append(product)
            
            # Create social media accounts
            await sync_to_async(self._create_social_accounts)(company, company_data)
            
            return company, products

    def _prepare_company_analysis_input(self, crawled_data: CrawledWebsiteData) -> str:
        """Prepare input string for company analysis agent"""
        pages_content = []
        
        for page in crawled_data.pages:
            page_info = f"""
=== PAGE: {page.title} ({page.url}) ===
Meta Description: {page.meta_description}

Headings:
{chr(10).join(f"- {heading}" for heading in page.headings)}

Content:
{page.content}

Contact Info: {page.contact_info}
Social Links: {page.social_links}
            """
            pages_content.append(page_info)
        
        input_data = f"""
WEBSITE CRAWL DATA FOR COMPANY ANALYSIS

Domain: {crawled_data.domain}
Main URL: {crawled_data.main_url}
Total Pages Crawled: {crawled_data.total_pages_crawled}
Crawl Method: {crawled_data.crawl_method}

PAGES CONTENT:
{chr(10).join(pages_content)}

Please analyze this website content and extract comprehensive company information including:
- Basic company details (name, industry, size, description)
- Brand guidelines (voice, values, colors, fonts)
- Business goals and target audience
- Unique value proposition
- Contact information and social media presence

Focus on extracting factual information from the content and making reasonable inferences where explicit information is not available.
        """
        
        return input_data

    def _prepare_product_analysis_input(self, crawled_data: CrawledWebsiteData, company_data: CompanyData) -> str:
        """Prepare input string for product analysis agent"""
        
        # Combine all page content for product analysis
        all_content = []
        for page in crawled_data.pages:
            all_content.append(f"Page: {page.title}\nContent: {page.content}\nHeadings: {', '.join(page.headings)}")
        
        input_data = f"""
COMPANY PRODUCT/SERVICE ANALYSIS

COMPANY INFORMATION:
Name: {company_data.name}
Industry: {company_data.industry}
Description: {company_data.description}
Target Audience: {company_data.target_audience}
Business Goals: {', '.join(company_data.primary_goals)}
Unique Value Proposition: {company_data.unique_value_proposition}

WEBSITE CONTENT FOR PRODUCT ANALYSIS:
{chr(10).join(all_content)}

Based on this company information and website content, identify and categorize all products and services offered by this company. Determine if they have multiple distinct products, a single main product, or if the company itself should be treated as the product.

For each product/service identified, extract detailed information including features, benefits, target audience, and positioning.
        """
        
        return input_data

    def _create_or_update_company(self, user: User, company_data: CompanyData, crawled_data: CrawledWebsiteData):
        """Create or update company in database (sync function)"""
        from main.models import Company
        
        # Convert Pydantic models to dict format for JSON fields
        brand_colors_dict = {}
        if company_data.brand_colors.primary:
            brand_colors_dict['primary'] = company_data.brand_colors.primary
        if company_data.brand_colors.secondary:
            brand_colors_dict['secondary'] = company_data.brand_colors.secondary
        if company_data.brand_colors.accent:
            brand_colors_dict['accent'] = company_data.brand_colors.accent
        
        brand_fonts_dict = {}
        if company_data.brand_fonts.primary:
            brand_fonts_dict['primary'] = company_data.brand_fonts.primary
        if company_data.brand_fonts.secondary:
            brand_fonts_dict['secondary'] = company_data.brand_fonts.secondary
        if company_data.brand_fonts.heading:
            brand_fonts_dict['heading'] = company_data.brand_fonts.heading
        
        # Check if company already exists for this user
        try:
            company = Company.objects.get(user=user)
            # Update existing company
            company.name = company_data.name
            company.industry = company_data.industry
            company.size = company_data.size
            company.description = company_data.description
            company.website = company_data.website
            company.brand_voice = company_data.brand_voice
            company.brand_values = company_data.brand_values
            company.brand_colors = brand_colors_dict
            company.brand_fonts = brand_fonts_dict
            company.primary_goals = company_data.primary_goals
            company.target_audience = company_data.target_audience
            company.unique_value_proposition = company_data.unique_value_proposition
            company.save()
            logger.info(f"Updated existing company: {company.name}")
        except Company.DoesNotExist:
            # Create new company
            company = Company.objects.create(
                user=user,
                name=company_data.name,
                industry=company_data.industry,
                size=company_data.size,
                description=company_data.description,
                website=company_data.website,
                brand_voice=company_data.brand_voice,
                brand_values=company_data.brand_values,
                brand_colors=brand_colors_dict,
                brand_fonts=brand_fonts_dict,
                primary_goals=company_data.primary_goals,
                target_audience=company_data.target_audience,
                unique_value_proposition=company_data.unique_value_proposition
            )
            logger.info(f"Created new company: {company.name}")
        
        return company

    def _create_product(self, company, product_data):
        """Create product in database (sync function)"""
        from main.models import Product
        
        # Extract price from the new pricing structure
        price_value = product_data.pricing.base_price if product_data.pricing.base_price else None
        
        product = Product.objects.create(
            company=company,
            name=product_data.name,
            description=product_data.description,
            category=product_data.category,
            price=price_value,
            features=product_data.features,
            benefits=product_data.benefits,
            target_audience=product_data.target_audience,
            keywords=product_data.keywords,
            competitors=product_data.competitors,
            is_active=True
        )
        
        logger.info(f"Created product: {product.name} for company: {company.name}")
        logger.info(f"Product pricing: {product_data.pricing.pricing_description}")
        return product

    def _create_social_accounts(self, company, company_data: CompanyData):
        """Create social media accounts (sync function)"""
        from main.models import SocialMediaAccount
        
        # Map social platform names to database choices and extract URLs from structured model
        social_accounts_data = [
            ('facebook', company_data.social_media_accounts.facebook),
            ('twitter', company_data.social_media_accounts.twitter),
            ('linkedin', company_data.social_media_accounts.linkedin),
            ('instagram', company_data.social_media_accounts.instagram),
            ('youtube', company_data.social_media_accounts.youtube),
            ('tiktok', company_data.social_media_accounts.tiktok),
            ('pinterest', company_data.social_media_accounts.pinterest),
        ]
        
        for platform_key, url in social_accounts_data:
            if url:  # Only create if URL is provided
                # Extract username from URL (simple extraction)
                username = url.split('/')[-1] if '/' in url else url
                
                social_account, created = SocialMediaAccount.objects.get_or_create(
                    company=company,
                    platform=platform_key,
                    defaults={
                        'username': username,
                        'url': url,
                        'is_active': True
                    }
                )
                
                if created:
                    logger.info(f"Created social account: {platform_key} for company: {company.name}")
                else:
                    # Update existing account
                    social_account.username = username
                    social_account.url = url
                    social_account.is_active = True
                    social_account.save()
                    logger.info(f"Updated social account: {platform_key} for company: {company.name}")


# Synchronous wrapper for Django views
def research_company_sync(url: str, user: User, max_pages: int = 5) -> Dict[str, Any]:
    """Synchronous wrapper for company research."""
    async def run_async():
        manager = CompanyResearchManager()
        return await manager.research_company(url, user, max_pages)
    
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        return loop.run_until_complete(run_async())
    finally:
        loop.close()
