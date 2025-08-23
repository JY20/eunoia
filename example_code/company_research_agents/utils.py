import requests
import asyncio
import re
from urllib.parse import urljoin, urlparse, parse_qs
from typing import List, Optional, Dict, Set
from pydantic import BaseModel
from asgiref.sync import sync_to_async
from bs4 import BeautifulSoup
from playwright.async_api import async_playwright

# Pydantic models for structured data
class CrawledPageData(BaseModel):
    url: str
    title: str
    content: str
    meta_description: str
    headings: List[str]
    links: List[str]
    images: List[str]
    contact_info: Dict[str, str]
    social_links: Dict[str, str]

class CrawledWebsiteData(BaseModel):
    domain: str
    main_url: str
    pages: List[CrawledPageData]
    total_pages_crawled: int
    crawl_method: str  # "requests" or "playwright"

def extract_domain(url: str) -> str:
    """Extract the domain from a URL"""
    parsed = urlparse(url)
    return f"{parsed.scheme}://{parsed.netloc}"

def is_same_domain(url1: str, url2: str) -> bool:
    """Check if two URLs belong to the same domain"""
    return urlparse(url1).netloc == urlparse(url2).netloc

def clean_url(url: str, base_url: str) -> str:
    """Clean and normalize URL"""
    if url.startswith('//'):
        url = 'https:' + url
    elif url.startswith('/'):
        url = urljoin(base_url, url)
    elif not url.startswith('http'):
        url = urljoin(base_url, url)
    
    # Remove fragments and common tracking parameters
    parsed = urlparse(url)
    query_params = parse_qs(parsed.query)
    # Remove common tracking parameters
    tracking_params = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid']
    for param in tracking_params:
        query_params.pop(param, None)
    
    # Rebuild query string
    query_string = '&'.join([f"{k}={v[0]}" for k, v in query_params.items()])
    cleaned_url = f"{parsed.scheme}://{parsed.netloc}{parsed.path}"
    if query_string:
        cleaned_url += f"?{query_string}"
    
    return cleaned_url

def extract_links_from_soup(soup: BeautifulSoup, base_url: str, domain: str) -> Set[str]:
    """Extract and filter links from BeautifulSoup object"""
    links = set()
    for link in soup.find_all('a', href=True):
        href = link.get('href')
        if not href:
            continue
            
        full_url = clean_url(href, base_url)
        
        # Only include links from the same domain
        if is_same_domain(full_url, domain):
            # Skip common non-content pages
            skip_patterns = [
                'mailto:', 'tel:', 'javascript:', '#',
                '/wp-admin', '/admin', '/login', '/register',
                '.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.gif',
                '/cart', '/checkout', '/account', '/profile'
            ]
            
            if not any(pattern in full_url.lower() for pattern in skip_patterns):
                links.add(full_url)
    
    return links

def extract_contact_info(soup: BeautifulSoup) -> Dict[str, str]:
    """Extract contact information from page"""
    contact_info = {}
    
    # Look for email addresses
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    page_text = soup.get_text()
    emails = re.findall(email_pattern, page_text)
    if emails:
        contact_info['email'] = emails[0]
    
    # Look for phone numbers
    phone_pattern = r'(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})'
    phones = re.findall(phone_pattern, page_text)
    if phones:
        contact_info['phone'] = ''.join(phones[0])
    
    # Look for address in common patterns
    address_keywords = ['address', 'location', 'office', 'headquarters']
    for keyword in address_keywords:
        element = soup.find(text=re.compile(keyword, re.IGNORECASE))
        if element and element.parent:
            parent_text = element.parent.get_text().strip()
            if len(parent_text) > 20 and len(parent_text) < 200:
                contact_info['address'] = parent_text
                break
    
    return contact_info

def extract_social_links(soup: BeautifulSoup) -> Dict[str, str]:
    """Extract social media links"""
    social_links = {}
    social_patterns = {
        'facebook': r'facebook\.com/[^/\s]+',
        'twitter': r'twitter\.com/[^/\s]+',
        'linkedin': r'linkedin\.com/[^/\s]+',
        'instagram': r'instagram\.com/[^/\s]+',
        'youtube': r'youtube\.com/[^/\s]+',
    }
    
    for link in soup.find_all('a', href=True):
        href = link.get('href')
        for platform, pattern in social_patterns.items():
            if re.search(pattern, href, re.IGNORECASE):
                social_links[platform] = href
                break
    
    return social_links


async def crawl_website_with_requests(url: str, max_pages: int = 5) -> CrawledWebsiteData:
    """
    Crawl a website using requests library.
    Starts with the main page and discovers other pages within the same domain.
    """
    domain = extract_domain(url)
    crawled_pages = []
    visited_urls = set()
    urls_to_crawl = {url}
    
    while urls_to_crawl and len(crawled_pages) < max_pages:
        current_url = urls_to_crawl.pop()
        if current_url in visited_urls:
            continue
            
        visited_urls.add(current_url)
        
        try:
            page_data = await crawl_single_page(current_url)
            if page_data:
                crawled_pages.append(page_data)
                
                # Add new links to crawl queue
                for link in page_data.links:
                    if link not in visited_urls and is_same_domain(link, domain):
                        urls_to_crawl.add(link)
                        
        except Exception as e:
            print(f"Error crawling {current_url}: {str(e)}")
            continue
    
    return CrawledWebsiteData(
        domain=domain,
        main_url=url,
        pages=crawled_pages,
        total_pages_crawled=len(crawled_pages),
        crawl_method="requests"
    )

async def crawl_single_page(page_url: str) -> Optional[CrawledPageData]:
    """Crawl a single page using requests"""
    try:
        # Use sync_to_async to run requests in thread pool
        response = await sync_to_async(requests.get)(
            page_url,
            timeout=10,
            headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        )
        response.raise_for_status()
        
        # Check content length (skip if too large)
        if len(response.content) > 1000000:  # 1MB limit
            return None
            
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Remove script and style elements
        for script in soup(["script", "style"]):
            script.decompose()
        
        # Extract data
        title = soup.find('title')
        title_text = title.get_text().strip() if title else ""
        
        meta_desc = soup.find('meta', attrs={'name': 'description'})
        meta_description = meta_desc.get('content', '') if meta_desc else ""
        
        # Extract headings
        headings = []
        for heading in soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']):
            text = heading.get_text().strip()
            if text and len(text) < 200:
                headings.append(text)
        
        # Get main content
        content = soup.get_text()
        content = re.sub(r'\s+', ' ', content).strip()
        
        # Extract links
        links = list(extract_links_from_soup(soup, page_url, extract_domain(page_url)))
        
        # Extract images
        images = []
        for img in soup.find_all('img', src=True):
            src = img.get('src')
            if src:
                full_img_url = urljoin(page_url, src)
                images.append(full_img_url)
        
        # Extract contact info and social links
        contact_info = extract_contact_info(soup)
        social_links = extract_social_links(soup)
        
        return CrawledPageData(
            url=page_url,
            title=title_text,
            content=content[:5000],  # Limit content length
            meta_description=meta_description,
            headings=headings[:10],  # Limit headings
            links=links[:20],  # Limit links
            images=images[:10],  # Limit images
            contact_info=contact_info,
            social_links=social_links
        )
        
    except Exception as e:
        print(f"Error crawling {page_url}: {str(e)}")
        return None

async def crawl_website_with_playwright(url: str, max_pages: int = 5) -> CrawledWebsiteData:
    """
    Crawl a website using Playwright for JavaScript-heavy sites.
    Use this when requests fails or returns insufficient content.
    """
    domain = extract_domain(url)
    crawled_pages = []
    visited_urls = set()
    urls_to_crawl = {url}
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        )
        
        try:
            while urls_to_crawl and len(crawled_pages) < max_pages:
                current_url = urls_to_crawl.pop()
                if current_url in visited_urls:
                    continue
                    
                visited_urls.add(current_url)
                
                try:
                    page = await context.new_page()
                    await page.goto(current_url, timeout=30000)
                    await page.wait_for_load_state('networkidle', timeout=10000)
                    
                    # Get page content
                    content = await page.content()
                    soup = BeautifulSoup(content, 'html.parser')
                    
                    # Remove script and style elements
                    for script in soup(["script", "style"]):
                        script.decompose()
                    
                    title = await page.title()
                    
                    # Extract meta description
                    meta_desc = await page.get_attribute('meta[name="description"]', 'content')
                    meta_description = meta_desc or ""
                    
                    # Extract headings
                    headings = []
                    for selector in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
                        heading_elements = await page.query_selector_all(selector)
                        for element in heading_elements:
                            text = await element.text_content()
                            if text and text.strip() and len(text.strip()) < 200:
                                headings.append(text.strip())
                    
                    # Get main content
                    page_content = soup.get_text()
                    page_content = re.sub(r'\s+', ' ', page_content).strip()
                    
                    # Extract links
                    links = list(extract_links_from_soup(soup, current_url, domain))
                    
                    # Extract images
                    images = []
                    img_elements = await page.query_selector_all('img[src]')
                    for img in img_elements:
                        src = await img.get_attribute('src')
                        if src:
                            full_img_url = urljoin(current_url, src)
                            images.append(full_img_url)
                    
                    # Extract contact info and social links
                    contact_info = extract_contact_info(soup)
                    social_links = extract_social_links(soup)
                    
                    page_data = CrawledPageData(
                        url=current_url,
                        title=title,
                        content=page_content[:5000],
                        meta_description=meta_description,
                        headings=headings[:10],
                        links=links[:20],
                        images=images[:10],
                        contact_info=contact_info,
                        social_links=social_links
                    )
                    
                    crawled_pages.append(page_data)
                    
                    # Add new links to crawl queue
                    for link in links:
                        if link not in visited_urls and is_same_domain(link, domain):
                            urls_to_crawl.add(link)
                    
                    await page.close()
                    
                except Exception as e:
                    print(f"Error crawling {current_url} with Playwright: {str(e)}")
                    continue
                    
        finally:
            await browser.close()
    
    return CrawledWebsiteData(
        domain=domain,
        main_url=url,
        pages=crawled_pages,
        total_pages_crawled=len(crawled_pages),
        crawl_method="playwright"
    )


async def smart_website_crawler(url: str, max_pages: int = 5) -> CrawledWebsiteData:
    """
    Smart website crawler that tries requests first, then falls back to Playwright if needed.
    This is the main function to use for website crawling.
    """
    try:
        # First try with requests (faster)
        result = await crawl_website_with_requests(url, max_pages)
        
        # Check if we got sufficient content
        if result.total_pages_crawled > 0:
            total_content_length = sum(len(page.content) for page in result.pages)
            if total_content_length > 500:  # If we got decent content
                return result
        
        # If requests didn't work well, try Playwright
        print(f"Requests method insufficient for {url}, trying Playwright...")
        return await crawl_website_with_playwright(url, max_pages)
        
    except Exception as e:
        print(f"Error in smart crawler for {url}: {str(e)}")
        # Try Playwright as fallback
        try:
            return await crawl_website_with_playwright(url, max_pages)
        except Exception as e2:
            print(f"Both crawling methods failed for {url}: {str(e2)}")
            # Return empty result
            return CrawledWebsiteData(
                domain=extract_domain(url),
                main_url=url,
                pages=[],
                total_pages_crawled=0,
                crawl_method="failed"
            )