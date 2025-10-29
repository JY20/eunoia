# How Movements Are Fetched for Test Charities

## TL;DR

**Movements are NOT automatically fetched when using `register_test_charities.py`.**

Test charities created via the script will only get:
- ✅ Basic AI extraction (description, tagline, category, keywords) via `process_charity_website()`
- ❌ **NO movements** (unless manually triggered)

---

## Complete Flow

### When Using `register_test_charities.py`

```
register_test_charities.py
    ↓
Charity.objects.create(**charity_data)  # Direct ORM call
    ↓
Django post_save signal triggered
    ↓
charity_post_save_receiver() in utils.py
    ↓
process_charity_website() called
    ├─ Fetches website HTML
    ├─ Extracts text content
    ├─ AI analysis (GPT-5):
    │   ├─ Generates description
    │   ├─ Extracts tagline
    │   ├─ Assigns category
    │   └─ Extracts keywords
    └─ Generates embedding
    ↓
❌ Movements NOT fetched
```

**Why?** The signal only calls `process_charity_website()`, which does basic extraction. It does **NOT** call `launch_charity_research_in_background()`.

---

### When Movements ARE Fetched

Movements are automatically fetched when charities are created/updated via:

#### 1. **REST API** (`CharityViewSet`)
```python
# In api_views.py
def perform_create(self, serializer):
    charity = serializer.save()
    if charity.website_url:
        launch_charity_research_in_background(charity.id, max_pages=6)  # ✅ Triggers movement research
```

#### 2. **Django Form** (`CharityRegistrationForm`)
```python
# In forms.py
def save(self, commit=True):
    charity = super().save(commit=commit)
    if charity and charity.website_url:
        launch_charity_research_in_background(charity.id, max_pages=6)  # ✅ Triggers movement research
```

---

## Movement Research Process

When `launch_charity_research_in_background()` is called:

```
launch_charity_research_in_background(charity_id, max_pages=6)
    ↓
research_charity_sync(charity_id, max_pages)
    ↓
CharityResearchManager.research_charity()
    ↓
┌─────────────────────────────────────────┐
│ Step 1: Crawl Website                    │
│   - smart_website_crawler()              │
│   - Crawls up to 6 pages                 │
│   - Extracts: title, content, headings   │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ Step 2: Extract Charity Profile         │
│   - charity_profile_agent               │
│   - Uses GPT-4.1 model                  │
│   - Extracts: tagline, summary,          │
│     keywords, category, etc.             │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ Step 3: Find Movements                  │
│   - movement_finder_agent                │
│   - Uses GPT-4.1 model                  │
│   - Identifies up to 5 movements        │
│   - For each movement extracts:         │
│     • title                              │
│     • summary                            │
│     • category                           │
│     • geography                          │
│     • source_urls                        │
│     • confidence_score                   │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ Step 4: Save to Database                │
│   - Updates charity fields              │
│   - Creates/updates Movement objects    │
│   - Generates embeddings for movements  │
└─────────────────────────────────────────┘
```

---

## How to Fetch Movements for Test Charities

### Option 1: Manual Trigger (Recommended)

Create a script to trigger research for all test charities:

```python
# trigger_movement_research.py
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'eunoia_backend.settings')
django.setup()

from main.models import Charity
from agents_sdk import launch_charity_research_in_background

test_charity_names = [
    'Global Water Initiative',
    'Education For All Foundation',
    'Wildlife Conservation Network',
    # ... etc
]

print("Triggering movement research for test charities...")
for name in test_charity_names:
    charity = Charity.objects.filter(name=name).first()
    if charity and charity.website_url:
        print(f"Researching: {name}")
        launch_charity_research_in_background(charity.id, max_pages=6)
    else:
        print(f"Skipping {name}: No charity found or no website URL")

print("✅ Research tasks launched in background!")
```

### Option 2: Update `register_test_charities.py`

Add movement research trigger after creating each charity:

```python
# At the end of register_test_charities.py
from agents_sdk import launch_charity_research_in_background

# ... existing code ...

for charity_data in test_charities:
    # ... existing creation code ...
    charity = Charity.objects.create(**charity_data)
    
    # Add this:
    if charity.website_url:
        print(f"🔄 Launching movement research for {charity.name}...")
        launch_charity_research_in_background(charity.id, max_pages=6)
```

### Option 3: Django Management Command

Use the existing research command:

```bash
python manage.py research_charity --charity-id 52
```

Or for all test charities:

```bash
python manage.py research_charity --all
```

---

## Movement Finder Agent Details

**Agent:** `movement_finder_agent`  
**Model:** GPT-4.1  
**Location:** `agents_sdk/charity_research_agents/movement_finder_agent.py`

**What it does:**
- Analyzes crawled website pages
- Identifies active initiatives/campaigns
- Extracts movement metadata:
  - Title (required)
  - Summary (optional)
  - Category (free-form, e.g., "children", "refugees", "environment")
  - Geography (country/region if available)
  - Start date (YYYY or YYYY-MM if available)
  - Source URLs (list of URLs that substantiate the movement)
  - Confidence score (0.0-1.0)

**Focus:** Recent/active initiatives with prominent pages or CTAs

**Output:** Up to 5 movements per charity

---

## Database Model

Movements are stored in the `Movement` model:

```python
class Movement(models.Model):
    charity = ForeignKey(Charity)
    title = CharField(max_length=255)
    slug = SlugField(max_length=300)  # Unique per charity
    summary = TextField()
    category = CharField(max_length=100)
    geography = CharField(max_length=255)
    start_date = DateField()
    source_urls = JSONField()  # List of URLs
    confidence_score = DecimalField()
    embedding = JSONField()  # For semantic matching
    is_active = BooleanField(default=True)
    # ... timestamps
```

**Unique constraint:** `(charity, slug)` - prevents duplicate movements per charity

---

## Key Differences: Basic vs Full Research

| Feature | `process_charity_website()` | `CharityResearchManager` |
|---------|----------------------------|--------------------------|
| **Triggered by** | post_save signal | API/form hooks, manual |
| **Website crawling** | ❌ No | ✅ Yes (up to 6 pages) |
| **Charity profile** | Basic AI extraction | Full profile analysis |
| **Movements** | ❌ Not fetched | ✅ Up to 5 movements |
| **Model used** | GPT-5 | GPT-4.1 |
| **Speed** | Fast (~few seconds) | Slower (~minutes) |
| **Use case** | Quick data extraction | Comprehensive research |

---

## Summary

- **Test charities from `register_test_charities.py`:** Only get basic AI extraction, NO movements
- **Charities created via API/Form:** Get full research including movements
- **To get movements for test charities:** Manually trigger `launch_charity_research_in_background()` for each charity

