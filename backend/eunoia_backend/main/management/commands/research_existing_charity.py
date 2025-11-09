from django.core.management.base import BaseCommand
from main.models import Charity
from agents_sdk import launch_charity_research_in_background, research_charity_sync


class Command(BaseCommand):
    help = "Trigger movement research for existing charities"

    def add_arguments(self, parser):
        parser.add_argument(
            '--charity-id',
            type=int,
            help='ID of the charity to research'
        )
        parser.add_argument(
            '--charity-name',
            type=str,
            help='Name of the charity to research'
        )
        parser.add_argument(
            '--all',
            action='store_true',
            help='Research all charities with website URLs'
        )
        parser.add_argument(
            '--test-only',
            action='store_true',
            help='Research only test charities (from register_test_charities.py)'
        )
        parser.add_argument(
            '--sync',
            action='store_true',
            help='Run research synchronously (waits for completion)'
        )
        parser.add_argument(
            '--max-pages',
            type=int,
            default=6,
            help='Maximum pages to crawl (default: 6)'
        )

    def handle(self, *args, **options):
        charity_id = options.get('charity_id')
        charity_name = options.get('charity_name')
        all_charities = options.get('all')
        test_only = options.get('test_only')
        sync_mode = options.get('sync')
        max_pages = options.get('max_pages')

        test_charity_names = [
            'Global Water Initiative',
            'Education For All Foundation',
            'Wildlife Conservation Network',
            'Green Earth Climate Action',
            'Community Health Partners',
            'Arts & Culture Preservation Society',
            'Human Rights Advocacy Network',
            'Disaster Relief Response Team',
            'Rural Development Initiative',
            'Tech For Good Collective'
        ]

        if sync_mode:
            research_func = research_charity_sync
            self.stdout.write(self.style.WARNING("Running in SYNC mode (will wait for completion)..."))
        else:
            research_func = launch_charity_research_in_background
            self.stdout.write(self.style.SUCCESS("Running in ASYNC mode (background threads)..."))

        # Research specific charity by ID
        if charity_id:
            try:
                charity = Charity.objects.get(id=charity_id)
                self._research_charity(charity, research_func, max_pages, sync_mode)
            except Charity.DoesNotExist:
                self.stdout.write(self.style.ERROR(f"Charity with ID {charity_id} not found!"))
            return

        # Research specific charity by name
        if charity_name:
            charity = Charity.objects.filter(name=charity_name).first()
            if not charity:
                self.stdout.write(self.style.ERROR(f"Charity '{charity_name}' not found!"))
                return
            self._research_charity(charity, research_func, max_pages, sync_mode)
            return

        # Research test charities only
        if test_only:
            self.stdout.write(self.style.SUCCESS("Researching test charities..."))
            charities = Charity.objects.filter(name__in=test_charity_names)
            self._research_multiple(charities, research_func, max_pages, sync_mode)
            return

        # Research all charities
        if all_charities:
            self.stdout.write(self.style.SUCCESS("Researching ALL charities with website URLs..."))
            charities = Charity.objects.exclude(website_url__isnull=True).exclude(website_url='')
            self._research_multiple(charities, research_func, max_pages, sync_mode)
            return

        # Default: show help
        self.stdout.write(self.style.WARNING("\nPlease specify what to research:"))
        self.stdout.write("  --charity-id <id>      Research specific charity by ID")
        self.stdout.write("  --charity-name <name>   Research specific charity by name")
        self.stdout.write("  --test-only             Research only test charities")
        self.stdout.write("  --all                   Research all charities with websites")
        self.stdout.write("\nOptions:")
        self.stdout.write("  --sync                  Run synchronously (wait for completion)")
        self.stdout.write("  --max-pages <n>         Max pages to crawl (default: 6)")

    def _research_charity(self, charity: Charity, research_func, max_pages: int, sync_mode: bool):
        """Research a single charity."""
        if not charity.website_url:
            self.stdout.write(self.style.ERROR(
                f"Charity '{charity.name}' (ID: {charity.id}) has no website URL!"
            ))
            return

        self.stdout.write(f"🔍 Researching: {charity.name} (ID: {charity.id})")
        self.stdout.write(f"   Website: {charity.website_url}")

        if sync_mode:
            result = research_func(charity.id, max_pages=max_pages)
            if result.get('success'):
                self.stdout.write(self.style.SUCCESS(
                    f"✅ Completed! Pages crawled: {result.get('pages_crawled')}, "
                    f"Movements found: {result.get('movements_found')}"
                ))
            else:
                self.stdout.write(self.style.ERROR(
                    f"❌ Failed: {result.get('error')}"
                ))
        else:
            research_func(charity.id, max_pages=max_pages)
            self.stdout.write(self.style.SUCCESS("✅ Research triggered in background!"))

    def _research_multiple(self, charities, research_func, max_pages: int, sync_mode: bool):
        """Research multiple charities."""
        total = charities.count()
        self.stdout.write(f"Found {total} charities to research\n")

        success_count = 0
        error_count = 0

        for charity in charities:
            if not charity.website_url:
                self.stdout.write(self.style.WARNING(
                    f"⚠️  Skipping '{charity.name}': No website URL"
                ))
                continue

            try:
                if sync_mode:
                    result = research_func(charity.id, max_pages=max_pages)
                    if result.get('success'):
                        success_count += 1
                        self.stdout.write(self.style.SUCCESS(
                            f"✅ {charity.name}: {result.get('movements_found')} movements found"
                        ))
                    else:
                        error_count += 1
                        self.stdout.write(self.style.ERROR(
                            f"❌ {charity.name}: {result.get('error')}"
                        ))
                else:
                    research_func(charity.id, max_pages=max_pages)
                    success_count += 1
                    self.stdout.write(f"🔄 {charity.name}: Research triggered")
            except Exception as e:
                error_count += 1
                self.stdout.write(self.style.ERROR(
                    f"❌ {charity.name}: {str(e)}"
                ))

        self.stdout.write("\n" + "=" * 60)
        self.stdout.write(self.style.SUCCESS(f"✅ Triggered research for {success_count} charities"))
        if error_count > 0:
            self.stdout.write(self.style.ERROR(f"❌ Failed for {error_count} charities"))
        if not sync_mode:
            self.stdout.write("\n💡 Research is running in background. Check logs for progress.")

