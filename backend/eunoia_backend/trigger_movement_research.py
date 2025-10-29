import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'eunoia_backend.settings')
django.setup()

from main.models import Charity
from agents_sdk import launch_charity_research_in_background

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

def trigger_research_for_test_charities():
    """Trigger movement research for all test charities."""
    print("=" * 60)
    print("Triggering movement research for test charities...")
    print("=" * 60)
    
    triggered = 0
    skipped = 0
    
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
        
        print(f"🔄 Launching research for: {name} (ID: {charity.id})")
        print(f"   Website: {charity.website_url}")
        launch_charity_research_in_background(charity.id, max_pages=6)
        triggered += 1
        print("-" * 60)
    
    print("=" * 60)
    print(f"✅ Successfully triggered research for {triggered} charities!")
    if skipped > 0:
        print(f"⚠️  Skipped {skipped} charities (not found or no website)")
    print("\n💡 Note: Research runs in background threads. Check logs for progress.")
    print("   Movements will appear in the database once research completes.")

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
    
    if len(sys.argv) > 1:
        arg = sys.argv[1].lower()
        
        if arg == "--all":
            trigger_research_for_all_charities()
        elif arg == "--test":
            trigger_research_for_test_charities()
        elif arg.isdigit():
            # Assume it's a charity ID
            trigger_research_for_charity_by_id(int(arg))
        else:
            # Assume it's a charity name
            trigger_research_for_charity_by_name(sys.argv[1])
    else:
        # Default: trigger for test charities
        print("Usage:")
        print("  python trigger_movement_research.py              # Test charities only")
        print("  python trigger_movement_research.py --test        # Test charities only")
        print("  python trigger_movement_research.py --all         # All charities")
        print("  python trigger_movement_research.py <charity_id>   # Specific charity by ID")
        print("  python trigger_movement_research.py '<name>'      # Specific charity by name")
        print()
        trigger_research_for_test_charities()

