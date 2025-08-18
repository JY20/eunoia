from __future__ import annotations

import random
import string
from django.core.management.base import BaseCommand, CommandError
import argparse
from django.utils.crypto import get_random_string
from django.db import transaction

from main.models import Charity
from django.db.models.signals import post_save
from main.utils import charity_post_save_receiver
from agents_sdk import research_charity_sync


def _random_email(domain: str | None = None) -> str:
    user = get_random_string(10).lower()
    dom = domain or random.choice(["example.org", "mail.test", "nonprofit.org"]).lower()
    return f"{user}@{dom}"


def _random_hex_address(length: int = 64) -> str:
    # Return 0x-prefixed hex string for Aptos-style address
    hex_chars = string.hexdigits.lower()
    body = ''.join(random.choice(hex_chars[:16]) for _ in range(length))
    return f"0x{body}"


class Command(BaseCommand):
    help = "Create a Charity from a URL with random required fields and run research to populate movements."

    def add_arguments(self, parser):
        parser.add_argument('url', type=str, help='Website URL of the charity to research')
        parser.add_argument('--name', type=str, default=None, help='Optional explicit charity name')
        parser.add_argument('--max-pages', type=int, default=6, help='Max pages to crawl (default: 6)')
        # Verified by default; allow override with --no-verified
        parser.add_argument('--verified', action=argparse.BooleanOptionalAction, default=True, help='Mark charity as verified (default: true)')

    def handle(self, *args, **options):
        # Use autocommit so the created Charity is visible to the async research thread
        if not transaction.get_autocommit():
            transaction.set_autocommit(True)
        url: str = options['url']
        name_opt: str | None = options.get('name')
        max_pages: int = options['max_pages']
        is_verified: bool = options['verified']

        if not url.startswith('http://') and not url.startswith('https://'):
            raise CommandError('URL must start with http:// or https://')

        name = name_opt or f"Charity {get_random_string(6)}"
        email = _random_email()
        aptos_addr = _random_hex_address()

        # Temporarily disable post_save processing to avoid synchronous website fetch
        try:
            post_save.disconnect(receiver=charity_post_save_receiver, sender=Charity)
        except Exception:
            pass

        charity = Charity.objects.create(
            name=name,
            description="",
            aptos_wallet_address=aptos_addr,
            website_url=url,
            contact_email=email,
            is_verified=is_verified,
        )

        # Reconnect signal
        try:
            post_save.connect(receiver=charity_post_save_receiver, sender=Charity)
        except Exception:
            pass

        self.stdout.write(self.style.SUCCESS(f"Created charity #{charity.id}: {charity.name}"))

        # Run research synchronously so command exits with result
        result = research_charity_sync(charity_id=charity.id, max_pages=max_pages)

        if result.get('success'):
            self.stdout.write(self.style.SUCCESS(
                f"Research completed. Pages crawled: {result.get('pages_crawled')}"
            ))
        else:
            self.stdout.write(self.style.WARNING(
                f"Research failed: {result.get('error')}"
            ))

        self.stdout.write(self.style.SUCCESS("Done."))


