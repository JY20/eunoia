from __future__ import annotations

import asyncio
import logging
import threading
from typing import Any, Dict, List

from asgiref.sync import sync_to_async
from django.utils.text import slugify

from agents import Runner, custom_span, gen_trace_id, trace, set_tracing_disabled
set_tracing_disabled(True)

from .utils import smart_website_crawler, CrawledWebsiteData
from .charity_profile_agent import charity_profile_agent, CharityProfile
from .movement_finder_agent import movement_finder_agent, MovementData, MovementAnalysisResult


logger = logging.getLogger(__name__)


class CharityResearchManager:
    async def research_charity(self, charity_id: int, max_pages: int = 6) -> Dict[str, Any]:
        trace_id = gen_trace_id()
        with trace("Charity research trace", trace_id=trace_id):
            from main.models import Charity

            try:
                charity = await sync_to_async(Charity.objects.get)(id=charity_id)
            except Charity.DoesNotExist:
                return {"success": False, "error": f"Charity {charity_id} not found", "trace_id": trace_id}

            if not charity.website_url:
                return {"success": False, "error": "Charity has no website_url", "trace_id": trace_id}

            # Step 1: Crawl
            crawled = await smart_website_crawler(charity.website_url, max_pages=max_pages)
            if not crawled.pages:
                return {"success": False, "error": "No crawlable content found", "trace_id": trace_id}

            # Step 2: Analyze profile
            profile_input = self._prepare_profile_input(crawled)
            profile_result = await Runner.run(charity_profile_agent, profile_input)
            profile: CharityProfile = profile_result.final_output_as(CharityProfile)

            # Step 3: Find movements
            movement_input = self._prepare_movement_input(crawled)
            movements_result = await Runner.run(movement_finder_agent, movement_input)
            analysis = movements_result.final_output_as(MovementAnalysisResult)
            movements: List[MovementData] = analysis.movements

            # Step 4: Save
            await self._save_outputs(charity_id, crawled, profile, movements)

            return {
                "success": True,
                "charity_id": charity_id,
                "pages_crawled": crawled.total_pages_crawled,
                "movements_found": len(movements),
                "trace_id": trace_id,
            }

    def _prepare_profile_input(self, crawled: CrawledWebsiteData) -> str:
        parts = []
        for p in crawled.pages:
            parts.append(f"PAGE: {p.title or ''} ({p.url})\nMeta: {p.meta_description or ''}\nHeadings: {', '.join(p.headings)}\nContent: {p.content}\n")
        return (
            f"CHARITY WEBSITE CRAWL DATA\nDomain: {crawled.domain}\nMain URL: {crawled.main_url}\n"
            f"Total Pages Crawled: {crawled.total_pages_crawled}\nCrawl Method: {crawled.crawl_method}\n\n"
            f"PAGES:\n{chr(10).join(parts)}\n"
            "Please extract the charity profile as per the schema."
        )

    def _prepare_movement_input(self, crawled: CrawledWebsiteData) -> str:
        parts = []
        for p in crawled.pages:
            parts.append(f"PAGE: {p.title or ''} ({p.url})\nHeadings: {', '.join(p.headings)}\nContent: {p.content}\n")
        return (
            f"CHARITY WEBSITE CRAWL DATA FOR MOVEMENT DISCOVERY\nDomain: {crawled.domain}\n"
            f"PAGES:\n{chr(10).join(parts)}\n"
            "Identify up to 5 top movements with supporting URLs."
        )

    async def _save_outputs(self, charity_id: int, crawled: CrawledWebsiteData, profile: CharityProfile, movements: List[MovementData]) -> None:
        from main.models import Charity, Movement

        def map_category(cat: str | None) -> str | None:
            if not cat:
                return None
            cat = cat.strip().upper()
            allowed = {"ENV","EDU","HEA","ANI","ART","HUM","COM","DIS","OTH"}
            return cat if cat in allowed else "OTH"

        charity = await sync_to_async(Charity.objects.get)(id=charity_id)

        # Update charity fields
        if profile.tagline:
            charity.tagline = profile.tagline
        if profile.summary and (not charity.description or len(charity.description) < 20):
            charity.description = profile.summary
        if profile.keywords:
            charity.keywords = profile.keywords
        mapped_category = map_category(profile.category)
        if mapped_category:
            charity.category = mapped_category
        if profile.country_of_operation:
            charity.country_of_operation = profile.country_of_operation
        if profile.year_founded:
            charity.year_founded = profile.year_founded
        if profile.contact_person:
            charity.contact_person = profile.contact_person

        if not charity.extracted_text_data:
            combined_text = "\n\n".join([p.content for p in crawled.pages])
            charity.extracted_text_data = combined_text[:15000]

        await sync_to_async(charity.save)()

        # Create/update movements
        for m in movements:
            if not m.title:
                continue
            base_slug = slugify(m.title)[:290]
            slug = await sync_to_async(self._unique_slug)(charity, base_slug)
            await sync_to_async(Movement.objects.update_or_create)(
                charity=charity,
                slug=slug,
                defaults={
                    'title': m.title,
                    'summary': m.summary or '',
                    'category': (m.category or None),
                    'geography': (m.geography or None),
                    'start_date': None,
                    'source_urls': (m.source_urls or []),
                    'confidence_score': round(float(m.confidence_score or 0.0), 3),
                    'is_active': True,
                }
            )

    def _unique_slug(self, charity, base_slug: str) -> str:
        from main.models import Movement
        slug = base_slug
        suffix = 1
        while Movement.objects.filter(charity=charity, slug=slug).exists():
            slug = f"{base_slug}-{suffix}"
            suffix += 1
            if suffix > 50:
                break
        return slug


def research_charity_sync(charity_id: int, max_pages: int = 6) -> Dict[str, Any]:
    async def _run():
        manager = CharityResearchManager()
        return await manager.research_charity(charity_id=charity_id, max_pages=max_pages)

    loop = asyncio.new_event_loop()
    try:
        return loop.run_until_complete(_run())
    finally:
        loop.close()


def launch_charity_research_in_background(charity_id: int, max_pages: int = 6) -> None:
    def _worker():
        try:
            res = research_charity_sync(charity_id=charity_id, max_pages=max_pages)
            logger.info(f"Charity research completed: {res}")
        except Exception as e:
            logger.error(f"Charity research error: {e}")

    t = threading.Thread(target=_worker, daemon=True)
    t.start()


