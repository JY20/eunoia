import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'eunoia_backend.settings')
django.setup()

from main.models import Charity

# Create a sample charity
charity = Charity.objects.create(
    name='Ocean Cleanup Foundation',
    description="Working to rid the world's oceans of plastic pollution through innovative technologies.",
    aptos_wallet_address='0x123...abc',
    contact_email='contact@oceancleanup.example.org',
    website_url='https://example.com/oceancleanup'
)

print(f"Created charity: {charity.name}")

# Create another sample charity
charity2 = Charity.objects.create(
    name='Reforestation Alliance',
    description="Planting trees and protecting forests to combat climate change and preserve biodiversity.",
    aptos_wallet_address='0x456...def',
    contact_email='contact@reforest.example.org',
    website_url='https://example.com/reforest'
)

print(f"Created charity: {charity2.name}") 