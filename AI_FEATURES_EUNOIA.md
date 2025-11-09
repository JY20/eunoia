# AI Features - Eunoia

## Charity Registration

We aim to make the charity registration process as seamless as possible. Our AI-powered system automatically extracts information from charity websites, categorizes charities, and discovers active movements/campaigns.

### Automated AI Processing

When a charity is registered **via the API or web form**, the following happens automatically:

1. **Basic AI Extraction** (via `process_charity_website()` signal)
   - Fetches and parses the charity's website
   - Uses GPT-5 to extract:
     - **Description**: 2-3 paragraph summary of mission and activities
     - **Tagline**: Short, catchy phrase (max 15 words)
     - **Category**: Automatically assigns from 9 categories (ENV, EDU, HEA, ANI, ART, HUM, COM, DIS, OTH)
     - **Keywords**: 5-7 relevant keywords describing the charity's focus
   - Generates semantic embedding for search/matching
   - Runs synchronously (completes in seconds)

2. **Comprehensive Research** (via `launch_charity_research_in_background()`)
   - Crawls charity website (up to 6 pages)
   - Uses GPT-4.1 to analyze:
     - **Charity Profile**: Detailed profile extraction
     - **Movements**: Discovers up to 5 active campaigns/initiatives per charity
   - Creates `Movement` objects with:
     - Title, summary, category, geography
     - Source URLs, confidence scores
     - Embeddings for semantic matching
   - Runs asynchronously in background (takes minutes)

### Test Charity Setup

For development and testing, we provide scripts to quickly set up test charities:

#### 1. Register Test Charities

By running:

```bash
cd backend/eunoia_backend
python register_test_charities.py
```

This script:
- Creates 10 test charities with diverse categories
- Pre-populates basic fields (name, description, wallet addresses, etc.)
- Triggers basic AI extraction (description, tagline, category, keywords)
- **Note**: Does NOT automatically fetch movements (see below)

**Output:**
```
Creating test charities...
==================================================
✅ Created: Global Water Initiative
   Category: Health & Medicine
   Location: Global
   Status: ✅ VERIFIED
   Contact: Sarah Chen
--------------------------------------------------
...
✅ Successfully created 10 test charities!
📊 Total charities in database: 10
```

#### 2. Fetch Movements for Test Charities

Since test charities are created via direct ORM (bypassing API hooks), movements must be fetched manually.

**Option A: Async Mode (Recommended)**
```bash
python trigger_movement_research.py
```

This will:
- Trigger research for all 10 test charities
- Wait for all background threads to complete
- Show progress as each charity finishes
- Display number of movements found per charity

**Option B: Sync Mode (One at a time)**
```bash
python trigger_movement_research.py --wait
```

This runs synchronously, showing results immediately for each charity.

**Option C: Django Management Command**
```bash
python manage.py research_existing_charity --test-only --sync
```

**Output:**
```
🔄 Launching research for: Global Water Initiative (ID: 55)
   Website: https://www.charitywater.org
------------------------------------------------------------
⏳ Waiting for background research to complete...
   [1/10] Thread completed
   ✅ Global Water Initiative: 3 movements found
   [2/10] Thread completed
   ✅ Education For All Foundation: 2 movements found
...
```

### Complete Setup Workflow

For a complete test environment setup:

```bash
# 1. Register test charities
python register_test_charities.py

# 2. Fetch movements for all test charities
python trigger_movement_research.py

# 3. Verify movements were created
python manage.py shell
```

```python
# In Django shell
from main.models import Charity, Movement

# Check movements for a charity
charity = Charity.objects.get(name="Global Water Initiative")
print(f"Movements for {charity.name}: {charity.movements.count()}")
for movement in charity.movements.all():
    print(f"  - {movement.title}: {movement.summary[:50]}...")
```

### What Happens Automatically vs Manually

| Action | When Created Via | What Runs Automatically |
|--------|-----------------|------------------------|
| **API** (`POST /api/charities/`) | REST API | ✅ Basic AI extraction<br>✅ Movement research |
| **Web Form** (`CharityRegistrationForm`) | Django form | ✅ Basic AI extraction<br>✅ Movement research |
| **Test Script** (`register_test_charities.py`) | Direct ORM | ✅ Basic AI extraction<br>❌ **NO** movement research* |

*Movements must be fetched manually using `trigger_movement_research.py`

### AI Models Used

| Feature | Model | Purpose |
|---------|-------|---------|
| Basic extraction | GPT-5 | Description, tagline, category, keywords |
| Embeddings | text-embedding-3-small | Semantic search vectors |
| Charity profile | GPT-4.1 | Detailed profile analysis |
| Movement discovery | GPT-4.1 | Finding active campaigns/initiatives |

### API Endpoints

- **Register Charity**: `POST /api/charities/`
  - Automatically triggers AI processing
  - Returns charity object with AI-populated fields
  
- **Get Charities**: `GET /api/charities/`
  - Returns all charities with AI-extracted data
  
- **Semantic Search**: `GET /api/charity-semantic-search/?query=<your_query>`
  - Uses embeddings for intelligent matching
  - Returns charities ranked by relevance

### Troubleshooting

**Problem**: Movements not appearing after registration
- **Solution**: Use `trigger_movement_research.py` if charity was created via test script
- **Check**: Verify charity has `website_url` set

**Problem**: AI extraction failed
- **Check**: Website URL is accessible and returns HTML
- **Check**: OpenAI API key is set in environment
- **Check**: Logs for specific error messages

**Problem**: Research taking too long
- **Normal**: Each charity can take 2-5 minutes
- **Tip**: Use `--sync` mode to see progress in real-time
- **Check**: Network connectivity and API rate limits

### Best Practices

1. **Always provide website_url**: AI features require a website to extract information
2. **Verify extraction**: Check that `description`, `tagline`, `category`, and `keywords` are populated
3. **Wait for movements**: Allow background research to complete (use `--wait` flag for sync mode)
4. **Monitor logs**: Check Django logs for research progress and errors
5. **Test first**: Use test charities to verify AI features before production use

