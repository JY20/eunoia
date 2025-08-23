import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'eunoia_backend.settings')
django.setup()

from main.models import Charity

print("=== CHARITY DATABASE STATUS ===")
print(f"Total charities: {Charity.objects.count()}")
print(f"Verified charities: {Charity.objects.filter(is_verified=True).count()}")
print(f"Unverified charities: {Charity.objects.filter(is_verified=False).count()}")

print("\n=== ALL CHARITIES ===")
for charity in Charity.objects.all().order_by('-date_registered'):
    status = "✅ VERIFIED" if charity.is_verified else "⏳ PENDING"
    print(f"{charity.name} - {status}")
    print(f"  Category: {charity.get_category_display() if charity.category else 'None'}")
    print(f"  Email: {charity.contact_email}")
    print(f"  Created: {charity.date_registered}")
    print("-" * 40)

print("\n=== CHARITIES VISIBLE TO FRONTEND ===")
visible_charities = Charity.objects.filter(is_verified=True)
print(f"Charities that would appear on frontend: {visible_charities.count()}")
for charity in visible_charities:
    print(f"- {charity.name}")
