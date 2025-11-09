import os
import django
import threading

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'eunoia_backend.settings')
django.setup()

from main.models import Charity
from agents_sdk import launch_charity_research_in_background, research_charity_sync

# List of test charity names from register_test_charities.py
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

def trigger_research_for_test_charities(wait_for_completion=False):
    """Trigger movement research for all test charities."""
    print("=" * 60)
    print("Triggering movement research for test charities...")
    if wait_for_completion:
        print("⏳ Running synchronously (will wait for completion)...")
    else:
        print("🔄 Running asynchronously (background threads)...")
    print("=" * 60)
    
    triggered = 0
    skipped = 0
    threads = []
    
    for name in test_charity_names:
        charity = Charity.objects.filter(name=name).first()
        if not charity:
            print(f"⚠️  '{name}' not found in database, skipping...")
            skipped += 1
            continue
        
        if not charity.website_url:
            print(f"⚠️  '{name}' has no website URL, skipping...")
            skipped += 1
            continue
        
        print(f"🔄 {'Researching' if wait_for_completion else 'Launching research for'}: {name} (ID: {charity.id})")
        print(f"   Website: {charity.website_url}")
        
        if wait_for_completion:
            # Run synchronously
            try:
                result = research_charity_sync(charity.id, max_pages=6)
                if result.get('success'):
                    print(f"   ✅ Completed: {result.get('movements_found', 0)} movements found")
                else:
                    print(f"   ❌ Failed: {result.get('error')}")
            except Exception as e:
                print(f"   ❌ Error: {str(e)}")
        else:
            # Run asynchronously but track threads
            def _research_with_tracking(charity_id, charity_name):
                try:
                    result = research_charity_sync(charity_id, max_pages=6)
                    if result.get('success'):
                        print(f"   ✅ {charity_name}: {result.get('movements_found', 0)} movements found")
                    else:
                        print(f"   ❌ {charity_name}: {result.get('error')}")
                except Exception as e:
                    print(f"   ❌ {charity_name}: Error - {str(e)}")
            
            thread = threading.Thread(
                target=_research_with_tracking,
                args=(charity.id, name),
                daemon=False  # Non-daemon so it keeps running
            )
            thread.start()
            threads.append(thread)
        
        triggered += 1
        print("-" * 60)
    
    # Wait for all threads to complete if running async
    if not wait_for_completion and threads:
        print("\n⏳ Waiting for background research to complete...")
        print("   (This may take several minutes per charity)")
        for i, thread in enumerate(threads, 1):
            thread.join()
            print(f"   [{i}/{len(threads)}] Thread completed")
    
    print("=" * 60)
    print(f"✅ Successfully {'completed' if wait_for_completion else 'triggered'} research for {triggered} charities!")
    if skipped > 0:
        print(f"⚠️  Skipped {skipped} charities (not found or no website)")
    
    if wait_for_completion:
        print("\n✨ All research completed! Check the database for movements.")
    else:
        print("\n✨ Research completed! Check the database for movements.")

def trigger_research_for_all_charities():
    """Trigger movement research for ALL charities with website URLs."""
    print("=" * 60)
    print("Triggering movement research for ALL charities with websites...")
    print("=" * 60)
    
    charities = Charity.objects.exclude(website_url__isnull=True).exclude(website_url='')
    total = charities.count()
    
    print(f"Found {total} charities with website URLs\n")
    
    triggered = 0
    for charity in charities:
        print(f"🔄 Launching research for: {charity.name} (ID: {charity.id})")
        print(f"   Website: {charity.website_url}")
        launch_charity_research_in_background(charity.id, max_pages=6)
        triggered += 1
    
    print("=" * 60)
    print(f"✅ Successfully triggered research for {triggered} charities!")
    print("\n💡 Note: Research runs in background threads. Check logs for progress.")

def trigger_research_for_charity_by_id(charity_id: int):
    """Trigger movement research for a specific charity by ID."""
    try:
        charity = Charity.objects.get(id=charity_id)
        
        if not charity.website_url:
            print(f"❌ Charity '{charity.name}' (ID: {charity_id}) has no website URL!")
            return
        
        print(f"🔄 Launching research for: {charity.name} (ID: {charity_id})")
        print(f"   Website: {charity.website_url}")
        launch_charity_research_in_background(charity_id, max_pages=6)
        print(f"✅ Research triggered! Check logs for progress.")
        
    except Charity.DoesNotExist:
        print(f"❌ Charity with ID {charity_id} not found!")

def trigger_research_for_charity_by_name(name: str):
    """Trigger movement research for a specific charity by name."""
    charity = Charity.objects.filter(name=name).first()
    
    if not charity:
        print(f"❌ Charity '{name}' not found!")
        return
    
    if not charity.website_url:
        print(f"❌ Charity '{name}' has no website URL!")
        return
    
    print(f"🔄 Launching research for: {charity.name} (ID: {charity.id})")
    print(f"   Website: {charity.website_url}")
    launch_charity_research_in_background(charity.id, max_pages=6)
    print(f"✅ Research triggered! Check logs for progress.")

if __name__ == "__main__":
    import sys
    
    # Check for --wait flag
    wait_for_completion = "--wait" in sys.argv or "--sync" in sys.argv
    if wait_for_completion:
        sys.argv = [arg for arg in sys.argv if arg not in ["--wait", "--sync"]]
    
    if len(sys.argv) > 1:
        arg = sys.argv[1].lower()
        
        if arg == "--all":
            trigger_research_for_all_charities()
        elif arg == "--test":
            trigger_research_for_test_charities(wait_for_completion=wait_for_completion)
        elif arg.isdigit():
            # Assume it's a charity ID
            if wait_for_completion:
                charity = Charity.objects.get(id=int(arg))
                result = research_charity_sync(int(arg), max_pages=6)
                if result.get('success'):
                    print(f"✅ Completed: {result.get('movements_found', 0)} movements found")
                else:
                    print(f"❌ Failed: {result.get('error')}")
            else:
                trigger_research_for_charity_by_id(int(arg))
        else:
            # Assume it's a charity name
            if wait_for_completion:
                charity = Charity.objects.filter(name=sys.argv[1]).first()
                if charity:
                    result = research_charity_sync(charity.id, max_pages=6)
                    if result.get('success'):
                        print(f"✅ Completed: {result.get('movements_found', 0)} movements found")
                    else:
                        print(f"❌ Failed: {result.get('error')}")
                else:
                    print(f"❌ Charity '{sys.argv[1]}' not found!")
            else:
                trigger_research_for_charity_by_name(sys.argv[1])
    else:
        # Default: trigger for test charities
        print("Usage:")
        print("  python trigger_movement_research.py              # Test charities (async)")
        print("  python trigger_movement_research.py --wait      # Test charities (sync, wait)")
        print("  python trigger_movement_research.py --test      # Test charities (async)")
        print("  python trigger_movement_research.py --all       # All charities")
        print("  python trigger_movement_research.py <id>        # Specific charity by ID")
        print("  python trigger_movement_research.py '<name>'     # Specific charity by name")
        print("\nAdd --wait or --sync to wait for completion (synchronous mode)")
        print()
        trigger_research_for_test_charities(wait_for_completion=wait_for_completion)

