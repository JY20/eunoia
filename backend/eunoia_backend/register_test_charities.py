import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'eunoia_backend.settings')
django.setup()

from main.models import Charity
from agents_sdk import research_charity_sync

# Clear existing test charities (optional - uncomment if you want to start fresh)
# Charity.objects.all().delete()

# Test charities with diverse categories and realistic data
test_charities = [
    {
        'name': 'Global Water Initiative',
        'description': 'Providing clean water access to underserved communities worldwide through sustainable infrastructure projects and local partnerships.',
        'category': 'HEA',  # Health & Medicine
        'aptos_wallet_address': '14avfLPyk7LjGEbFFdDU7vRLQQt6BKzNfZcFauhuub5mghb1',
        'polkadot_wallet_address': '14avfLPyk7LjGEbFFdDU7vRLQQt6BKzNfZcFauhuub5mghb1',
        'contact_email': 'info@globalwater.org',
        'website_url': 'https://www.charitywater.org',
        'tagline': 'Clean water for everyone, everywhere',
        'country_of_operation': 'Global',
        'year_founded': 2015,
        'contact_person': 'Sarah Chen',
        'is_verified': True
    },
    {
        'name': 'Education For All Foundation',
        'description': 'Building schools and providing educational resources in rural areas to ensure every child has access to quality education.',
        'category': 'EDU',  # Education
        'aptos_wallet_address': '14avfLPyk7LjGEbFFdDU7vRLQQt6BKzNfZcFauhuub5mghb1',
        'polkadot_wallet_address': '14avfLPyk7LjGEbFFdDU7vRLQQt6BKzNfZcFauhuub5mghb1',
        'contact_email': 'hello@educationforall.org',
        'website_url': 'https://www.roomtoread.org',
        'tagline': 'Every child deserves an education',
        'country_of_operation': 'Kenya',
        'year_founded': 2008,
        'contact_person': 'Michael Okoye',
        'is_verified': True
    },
    {
        'name': 'Wildlife Conservation Network',
        'description': 'Protecting endangered species and their habitats through research, conservation programs, and community engagement initiatives.',
        'category': 'ANI',  # Animal Welfare
        'aptos_wallet_address': '14avfLPyk7LjGEbFFdDU7vRLQQt6BKzNfZcFauhuub5mghb1',
        'polkadot_wallet_address': '14avfLPyk7LjGEbFFdDU7vRLQQt6BKzNfZcFauhuub5mghb1',
        'contact_email': 'conservation@wildlifenetwork.org',
        'website_url': 'https://www.worldwildlife.org',
        'tagline': 'Saving wildlife for future generations',
        'country_of_operation': 'Tanzania',
        'year_founded': 1995,
        'contact_person': 'Dr. Jane Mwangi',
        'is_verified': True
    },
    {
        'name': 'Green Earth Climate Action',
        'description': 'Fighting climate change through reforestation, renewable energy projects, and sustainable agriculture programs in developing nations.',
        'category': 'ENV',  # Environment
        'aptos_wallet_address': '14avfLPyk7LjGEbFFdDU7vRLQQt6BKzNfZcFauhuub5mghb1',
        'polkadot_wallet_address': '14avfLPyk7LjGEbFFdDU7vRLQQt6BKzNfZcFauhuub5mghb1',
        'contact_email': 'action@greenearth.org',
        'website_url': 'https://www.greenpeace.org',
        'tagline': 'One planet, one chance',
        'country_of_operation': 'Brazil',
        'year_founded': 2010,
        'contact_person': 'Carlos Rodriguez',
        'is_verified': True
    },
    {
        'name': 'Community Health Partners',
        'description': 'Delivering essential healthcare services to remote communities through mobile clinics and telemedicine programs.',
        'category': 'HEA',  # Health & Medicine
        'aptos_wallet_address': '14avfLPyk7LjGEbFFdDU7vRLQQt6BKzNfZcFauhuub5mghb1',
        'polkadot_wallet_address': '14avfLPyk7LjGEbFFdDU7vRLQQt6BKzNfZcFauhuub5mghb1',
        'contact_email': 'care@communityhealthpartners.org',
        'website_url': 'https://www.doctorswithoutborders.org',
        'tagline': 'Healthcare where it\'s needed most',
        'country_of_operation': 'Bangladesh',
        'year_founded': 2012,
        'contact_person': 'Dr. Fatima Hassan',
        'is_verified': True
    },
    {
        'name': 'Arts & Culture Preservation Society',
        'description': 'Preserving traditional arts, music, and cultural heritage while supporting emerging artists in indigenous communities.',
        'category': 'ART',  # Arts & Culture
        'aptos_wallet_address': '14avfLPyk7LjGEbFFdDU7vRLQQt6BKzNfZcFauhuub5mghb1',
        'polkadot_wallet_address': '14avfLPyk7LjGEbFFdDU7vRLQQt6BKzNfZcFauhuub5mghb1',
        'contact_email': 'preserve@artsculture.org',
        'website_url': 'https://www.culturalpreservation.org',
        'tagline': 'Keeping traditions alive',
        'country_of_operation': 'Peru',
        'year_founded': 2018,
        'contact_person': 'Maria Quispe',
        'is_verified': False  # Not verified yet
    },
    {
        'name': 'Human Rights Advocacy Network',
        'description': 'Defending human rights, promoting social justice, and providing legal aid to marginalized communities worldwide.',
        'category': 'HUM',  # Human Rights
        'aptos_wallet_address': '14avfLPyk7LjGEbFFdDU7vRLQQt6BKzNfZcFauhuub5mghb1',
        'polkadot_wallet_address': '14avfLPyk7LjGEbFFdDU7vRLQQt6BKzNfZcFauhuub5mghb1',
        'contact_email': 'justice@humanrights.org',
        'website_url': 'https://www.amnesty.org',
        'tagline': 'Justice for all, everywhere',
        'country_of_operation': 'Global',
        'year_founded': 2005,
        'contact_person': 'James Thompson',
        'is_verified': True
    },
    {
        'name': 'Disaster Relief Response Team',
        'description': 'Providing immediate emergency aid and long-term recovery support to communities affected by natural disasters.',
        'category': 'DIS',  # Disaster Relief
        'aptos_wallet_address': '14avfLPyk7LjGEbFFdDU7vRLQQt6BKzNfZcFauhuub5mghb1',
        'polkadot_wallet_address': '14avfLPyk7LjGEbFFdDU7vRLQQt6BKzNfZcFauhuub5mghb1',
        'contact_email': 'emergency@disasterrelief.org',
        'website_url': 'https://www.redcross.org',
        'tagline': 'First to respond, last to leave',
        'country_of_operation': 'Philippines',
        'year_founded': 2000,
        'contact_person': 'Anna Santos',
        'is_verified': True
    },
    {
        'name': 'Rural Development Initiative',
        'description': 'Empowering rural communities through infrastructure development, microfinance programs, and agricultural training.',
        'category': 'COM',  # Community Development
        'aptos_wallet_address': '14avfLPyk7LjGEbFFdDU7vRLQQt6BKzNfZcFauhuub5mghb1',
        'polkadot_wallet_address': '14avfLPyk7LjGEbFFdDU7vRLQQt6BKzNfZcFauhuub5mghb1',
        'contact_email': 'develop@ruralinitiative.org',
        'website_url': 'https://www.grameen-info.org',
        'tagline': 'Building stronger communities together',
        'country_of_operation': 'India',
        'year_founded': 2007,
        'contact_person': 'Raj Patel',
        'is_verified': True
    },
    {
        'name': 'Tech For Good Collective',
        'description': 'Leveraging technology to solve social problems through digital literacy programs and innovative tech solutions for nonprofits.',
        'category': 'OTH',  # Other
        'aptos_wallet_address': '14avfLPyk7LjGEbFFdDU7vRLQQt6BKzNfZcFauhuub5mghb1',
        'polkadot_wallet_address': '14avfLPyk7LjGEbFFdDU7vRLQQt6BKzNfZcFauhuub5mghb1',
        'contact_email': 'innovation@techforgood.org',
        'website_url': 'https://www.code.org',
        'tagline': 'Technology that changes lives',
        'country_of_operation': 'United States',
        'year_founded': 2020,
        'contact_person': 'Alex Kim',
        'is_verified': False  # Not verified yet
    }
]

created_charities = []

print("Creating test charities...")
print("=" * 50)

for charity_data in test_charities:
    try:
        # Check if charity already exists
        existing = Charity.objects.filter(name=charity_data['name']).first()
        if existing:
            print(f"⚠️  Charity '{charity_data['name']}' already exists, skipping...")
            continue
            
        charity = Charity.objects.create(**charity_data)
        created_charities.append(charity)
        
        # Trigger movement research synchronously if website URL exists
        # This ensures movements are populated before deployment completes
        if charity.website_url:
            try:
                print(f"🔄 Researching movements for {charity.name}...")
                result = research_charity_sync(charity.id, max_pages=6)
                if result.get('success'):
                    movements_count = result.get('movements_found', 0)
                    print(f"   ✅ Found {movements_count} movements")
                else:
                    print(f"   ⚠️  Research failed: {result.get('error', 'Unknown error')}")
            except Exception as e:
                print(f"⚠️  Could not research movements for {charity.name}: {e}")
        
        status = "✅ VERIFIED" if charity.is_verified else "⏳ PENDING"
        print(f"✅ Created: {charity.name}")
        print(f"   Category: {charity.get_category_display()}")
        print(f"   Location: {charity.country_of_operation}")
        print(f"   Status: {status}")
        print(f"   Contact: {charity.contact_person}")
        print("-" * 40)
        
    except Exception as e:
        print(f"❌ Error creating charity '{charity_data['name']}': {e}")

print("=" * 50)
print(f"✅ Successfully created {len(created_charities)} test charities!")
print(f"📊 Total charities in database: {Charity.objects.count()}")
print(f"✅ Verified charities: {Charity.objects.filter(is_verified=True).count()}")
print(f"⏳ Pending verification: {Charity.objects.filter(is_verified=False).count()}")

print("\n📋 Categories represented:")
categories = Charity.objects.values_list('category', flat=True).distinct()
for category in categories:
    if category:
        display_name = dict(Charity.CharityCategory.choices)[category]
        count = Charity.objects.filter(category=category).count()
        print(f"   {display_name}: {count} charities")

print("\n🌍 Countries represented:")
countries = Charity.objects.exclude(country_of_operation__isnull=True).exclude(country_of_operation='').values_list('country_of_operation', flat=True).distinct()
for country in sorted(countries):
    count = Charity.objects.filter(country_of_operation=country).count()
    print(f"   {country}: {count} charities")

print("\n🔗 Aptos wallet addresses:")
for charity in created_charities[:3]:  # Show first 3 as examples
    print(f"   {charity.name}: {charity.aptos_wallet_address}")

print("\n✨ Test charities are ready for blockchain donations!")
print("\n💡 Movements have been researched and populated for charities with website URLs.")
print("   To check movements: GET /api/movements/ or GET /api/charities/<id>/movements/")
