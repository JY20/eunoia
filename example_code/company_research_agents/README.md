# Company Research Agents

A comprehensive AI-powered system for automated company research and data extraction from websites. This system uses OpenAI Agents SDK to intelligently crawl websites, analyze company information, and identify products/services.

## Overview

The Company Research Agents system performs the following workflow:

1. **Website Crawling** - Intelligently crawls company websites using requests/playwright
2. **Company Analysis** - Extracts structured company data using AI analysis  
3. **Product Discovery** - Identifies and categorizes products/services
4. **Database Integration** - Saves all data to Django models with proper relationships

## Components

### 📁 Files Structure

- `manager.py` - Main orchestrator with step-by-step workflow
- `utils.py` - Web crawling tools (requests + playwright fallback)
- `company_analysis_agent.py` - AI agent for company data extraction
- `product_finder_agent.py` - AI agent for product/service identification
- `__init__.py` - Package exports

### 🔧 Core Classes

- **CompanyResearchManager** - Main workflow orchestrator
- **CrawledWebsiteData** - Structured website content data
- **CompanyData** - Extracted company information (matches Django Company model)
- **ProductAnalysisResult** - Identified products/services data

## Usage

### Basic Usage

```python
from agents_sdk.company_research_agents import research_company_sync
from django.contrib.auth.models import User

# Get user instance
user = User.objects.get(username='example_user')

# Research a company
result = research_company_sync(
    url='https://example-company.com',
    user=user,
    max_pages=5
)

if result['success']:
    print(f"Company created with ID: {result['company_id']}")
    print(f"Products created: {result['products_created']}")
    print(f"Pages crawled: {result['pages_crawled']}")
else:
    print(f"Error: {result['error']}")
```

### Advanced Usage

```python
from agents_sdk.company_research_agents import CompanyResearchManager

# Use the manager directly for more control
manager = CompanyResearchManager()

# Async usage
import asyncio

async def research_example():
    result = await manager.research_company(
        url='https://example-company.com',
        user=user,
        max_pages=10
    )
    return result

result = asyncio.run(research_example())
```

## Workflow Steps

### Step 1: Website Crawling
- Uses smart crawler that tries requests first, falls back to playwright
- Discovers pages within the same domain
- Extracts content, headings, links, images, contact info
- Filters out non-content pages (admin, cart, etc.)

### Step 2: Company Analysis  
- Analyzes crawled content with GPT-4o-mini
- Extracts company name, industry, size, description
- Identifies brand voice, values, colors, fonts
- Determines business goals and target audience
- Finds unique value proposition

### Step 3: Product Discovery
- Identifies if company has multiple products, single product, or is service-based
- Extracts product names, descriptions, categories
- Finds features, benefits, target audiences
- Identifies keywords and competitors
- Categorizes business model (SaaS, ecommerce, consulting, etc.)

### Step 4: Database Storage
- Creates/updates Company record linked to user
- Creates Product records with full details
- Creates SocialMediaAccount records from discovered social links
- Uses proper async/sync handling for Django ORM

## Data Models

### Company Data Extracted
- Basic info: name, industry, size, description, website
- Brand: voice, values, colors, fonts  
- Business: goals, target audience, value proposition
- Contact: email, phone, social media accounts

### Product Data Extracted
- Product: name, description, category, price
- Details: features, benefits, target audience
- Marketing: keywords, competitors
- Metadata: confidence scores, business model analysis

## Configuration

### Industry Categories
Supports automatic categorization into:
- SaaS/Technology, E-commerce, Healthcare, Finance
- Education, Manufacturing, Retail, Professional Services
- Non-profit, Other

### Company Size Detection
Estimates company size based on content:
- Startup (1-10), Small (11-50), Medium (51-200)
- Large (201-1000), Enterprise (1000+)

### Crawling Settings
- Max pages: Configurable (default 5)
- Content limits: 5000 chars per page, 1MB max page size
- Timeout: 10s for requests, 30s for playwright
- User-Agent: Modern browser simulation

## Error Handling

- Graceful fallback from requests to playwright
- Comprehensive error logging with trace IDs
- Partial success handling (saves what data is available)
- Network timeout and retry logic

## Performance Notes

- Uses async/await for concurrent processing
- Thread pool for sync requests operations
- Intelligent content filtering and size limits
- OpenAI API usage tracking and cost monitoring

## Dependencies

- Django (ORM integration)
- OpenAI Agents SDK (AI processing)
- requests (fast HTTP crawling)
- playwright (JavaScript-heavy sites)
- beautifulsoup4 (HTML parsing)
- pydantic (data validation)

## Example Output

```python
{
    'success': True,
    'company_id': 123,
    'products_created': 3,
    'pages_crawled': 5,
    'crawl_method': 'requests',
    'company_data': CompanyData(...),
    'product_analysis': ProductAnalysisResult(...),
    'trace_id': 'abc-123-def'
}
```

## Running the Example

```bash
# From your Django project root
python agents_sdk/company_research_agents/example.py
```

## Integration

This system integrates with the MarkMill platform's:
- User management (Django auth)
- Company onboarding flow
- Product catalog management
- Marketing campaign generation

Perfect for automating the research phase of marketing campaign development!