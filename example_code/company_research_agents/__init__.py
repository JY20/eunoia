"""
Company Research Agents Package

This package provides AI-powered company research capabilities including:
- Website crawling and content extraction  
- Company data analysis and extraction
- Product/service identification
- Database integration with Django models

Main entry point: research_company_sync()
"""

from .manager import CompanyResearchManager, research_company_sync
from .utils import smart_website_crawler, CrawledWebsiteData, CrawledPageData
from .company_analysis_agent import company_analysis_agent, CompanyData
from .product_finder_agent import product_finder_agent, ProductAnalysisResult

__all__ = [
    'CompanyResearchManager',
    'research_company_sync',
    'smart_website_crawler',
    'CrawledWebsiteData',
    'CrawledPageData',
    'company_analysis_agent',
    'CompanyData',
    'product_finder_agent',
    'ProductAnalysisResult',
]
