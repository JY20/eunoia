import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'eunoia_backend.settings')
django.setup()

from main.models import Charity

print("=== VERIFYING ALL CHARITIES ===")

# Get all unverified charities
unverified_charities = Charity.objects.filter(is_verified=False)
print(f"Found {unverified_charities.count()} unverified charities")

if unverified_charities.exists():
    for charity in unverified_charities:
        print(f"✅ Verifying: {charity.name}")
        charity.is_verified = True
        charity.save()
    
    print(f"\n🎉 Successfully verified {unverified_charities.count()} charities!")
else:
    print("✅ All charities are already verified!")

print(f"\n📊 Final Status:")
print(f"Total charities: {Charity.objects.count()}")
print(f"Verified charities: {Charity.objects.filter(is_verified=True).count()}")
print(f"Unverified charities: {Charity.objects.filter(is_verified=False).count()}")

print("\n🌐 These charities will now appear on your frontend:")
for charity in Charity.objects.filter(is_verified=True).order_by('name'):
    print(f"  - {charity.name} ({charity.get_category_display()})")



