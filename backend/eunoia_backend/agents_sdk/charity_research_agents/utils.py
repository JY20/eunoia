from __future__ import annotations

from typing import List, Optional, Set
from urllib.parse import urlparse, urljoin

from pydantic import BaseModel
import requests
from bs4 import BeautifulSoup


class CrawledPageData(BaseModel):
    url: str
    title: Optional[str] = None
    meta_description: Optional[str] = None
    headings: List[str] = []
    content: str = ""


class CrawledWebsiteData(BaseModel):
    domain: str
    main_url: str
    pages: List[CrawledPageData]
    total_pages_crawled: int
    crawl_method: str = "requests"


def _is_same_domain(base_netloc: str, link_url: str) -> bool:
    try:
        parsed = urlparse(link_url)
        if not parsed.netloc:
            return True  # relative URL
        return parsed.netloc == base_netloc
    except Exception:
        return False


def _clean_text(text: str, max_len: int = 8000) -> str:
    cleaned = " ".join(text.split())
    return cleaned[:max_len]


def _extract_page_data(url: str, html: str) -> CrawledPageData:
    soup = BeautifulSoup(html, 'html.parser')
    title_tag = soup.find('title')
    title = title_tag.text.strip() if title_tag else None
    meta_desc_tag = soup.find('meta', attrs={'name': 'description'})
    meta_description = meta_desc_tag['content'].strip() if meta_desc_tag and meta_desc_tag.get('content') else None
    headings = [h.get_text(strip=True) for h in soup.find_all(['h1', 'h2', 'h3'])][:30]
    for tag in soup(['script', 'style', 'noscript']):
        tag.decompose()
    text_content = soup.get_text(" ", strip=True)
    content = _clean_text(text_content)
    return CrawledPageData(url=url, title=title, meta_description=meta_description, headings=headings, content=content)


def _fetch_url(url: str, timeout: int = 10) -> Optional[str]:
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
    }
    try:
        resp = requests.get(url, headers=headers, timeout=timeout)
        if resp.status_code == 200 and 'text/html' in resp.headers.get('Content-Type', ''):
            return resp.text
        return None
    except Exception:
        return None


async def smart_website_crawler(url: str, max_pages: int = 6) -> CrawledWebsiteData:
    parsed = urlparse(url)
    base_netloc = parsed.netloc
    base_root = f"{parsed.scheme}://{parsed.netloc}"

    queue: List[str] = [url]
    seen: Set[str] = set()
    pages: List[CrawledPageData] = []

    while queue and len(pages) < max_pages:
        current = queue.pop(0)
        if current in seen:
            continue
        seen.add(current)

        html = _fetch_url(current)
        if not html:
            continue
        page_data = _extract_page_data(current, html)
        pages.append(page_data)

        soup = BeautifulSoup(html, 'html.parser')
        for a in soup.find_all('a', href=True):
            href = a['href'].strip()
            if href.startswith('#') or href.startswith('mailto:') or href.startswith('tel:'):
                continue
            absolute = urljoin(current, href)
            if _is_same_domain(base_netloc, absolute) and absolute.startswith(base_root):
                if absolute not in seen and absolute not in queue:
                    queue.append(absolute)

    return CrawledWebsiteData(
        domain=base_netloc,
        main_url=url,
        pages=pages,
        total_pages_crawled=len(pages),
    )


