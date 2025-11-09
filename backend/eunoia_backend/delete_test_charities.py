import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'eunoia_backend.settings')
django.setup()

from main.models import Charity

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

print("Deleting test charities...")
print("=" * 50)

deleted_count = 0
for name in test_charity_names:
    try:
        charity = Charity.objects.filter(name=name).first()
        if charity:
            charity.delete()
            print(f"✅ Deleted: {name}")
            deleted_count += 1
        else:
            print(f"⚠️  Charity '{name}' not found, skipping...")
    except Exception as e:
        print(f"❌ Error deleting charity '{name}': {e}")

print("=" * 50)
print(f"✅ Successfully deleted {deleted_count} test charities!")
print(f"📊 Remaining charities in database: {Charity.objects.count()}")


