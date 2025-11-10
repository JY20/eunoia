# Testing Guide

This guide explains how to install, run, and test the Eunoia Compass deliverables.

## Prerequisites

### System Requirements
- Python 3.10 or higher
- Node.js 20 or higher
- Git
- Polkadot wallet extension (for frontend testing)

### Environment Setup

1. **Clone the repository**:
```bash
git clone https://github.com/JY20/eunoia.git
cd eunoia
git checkout c90f043  # Milestone 2 commit
```

2. **Set up environment variables**:

Create `.env` file in `backend/eunoia_backend/`:
```bash
SECRET_KEY=your-django-secret-key
DEBUG=True
OPENAI_API_KEY=your-openai-api-key
ALLOWED_HOSTS=localhost,127.0.0.1
```

## Backend Installation & Testing

### Installation

1. **Navigate to backend directory**:
```bash
cd backend/eunoia_backend
```

2. **Create and activate virtual environment**:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**:
```bash
pip install -r requirements.txt
```

4. **Run migrations**:
```bash
python manage.py migrate
```

5. **Create superuser (optional)**:
```bash
python manage.py createsuperuser
```

### Running Unit Tests

#### Run all tests:
```bash
cd backend/eunoia_backend
python manage.py test ../../tests
```

#### Run specific test modules:

**Charity Registration Tests**:
```bash
cd backend/eunoia_backend
python manage.py test ../../tests.test_charity_registration
```

**Movement Research Tests**:
```bash
cd backend/eunoia_backend
python manage.py test ../../tests.test_movements_research
```

**Compass Matching Tests**:
```bash
cd backend/eunoia_backend
python manage.py test ../../tests.test_compass_matching
```

#### Run with verbose output:
```bash
cd backend/eunoia_backend
python manage.py test ../../tests --verbosity=2
```

#### Run with coverage report:
```bash
cd backend/eunoia_backend
pip install coverage
coverage run --source='.' manage.py test ../../tests
coverage report
coverage html  # Generates HTML report in htmlcov/
```

### Test Coverage

The test suite covers:

1. **Charity Registration** (`test_charity_registration.py`)
   - Model creation and validation
   - Form validation (email, wallet address, required fields)
   - Logo file uploads
   - Background research triggering
   - API endpoint integration

2. **Movement Research** (`test_movements_research.py`)
   - Website crawling functionality
   - AI profile extraction
   - Movement discovery
   - Embedding generation
   - End-to-end research workflow
   - Background execution

3. **Compass Matching** (`test_compass_matching.py`)
   - Semantic similarity computation
   - Movement filtering (active only, with embeddings)
   - Grouping by charity
   - Top-3 recommendation selection
   - API endpoints

### Manual API Testing

#### Start the development server:
```bash
python manage.py runserver
```

#### Test Compass Matching:
```bash
curl -X POST http://127.0.0.1:8000/api/compass/match/ \
  -H "Content-Type: application/json" \
  -d '{
    "query": "I want to help children in Africa get education",
    "top_k": 10
  }'
```

Expected response:
```json
{
  "query": "I want to help children in Africa get education",
  "grouped_matches": { ... },
  "raw_matches": [ ... ],
  "recommendations": {
    "top_recommendations": [
      {
        "movement_id": 1,
        "charity_name": "...",
        "movement_title": "...",
        "reason": "..."
      }
    ]
  }
}
```

#### Test Semantic Search:
```bash
curl "http://127.0.0.1:8000/api/charity-semantic-search/?query=education%20in%20Africa"
```

#### Test Charity Listing:
```bash
curl "http://127.0.0.1:8000/api/charities/?is_verified=true"
```

#### Test Movement Listing:
```bash
curl "http://127.0.0.1:8000/api/movements/"
```

### Testing One-Link Registration

1. **Via Django Admin** (requires superuser):
   - Navigate to http://127.0.0.1:8000/admin/
   - Go to Charities → Add Charity
   - Fill in required fields including `website_url`
   - Save → Background research will trigger automatically

2. **Via API**:
```bash
curl -X POST http://127.0.0.1:8000/api/charities/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Charity",
    "description": "A test charity",
    "aptos_wallet_address": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    "contact_email": "test@charity.org",
    "website_url": "https://www.testcharity.org"
  }'
```

3. **Check research results**:
```bash
# Get charity details
curl "http://127.0.0.1:8000/api/charities/1/"

# Check discovered movements
curl "http://127.0.0.1:8000/api/movements/?charity=1"
```

### Research Existing Charities

To trigger movement research for charities that don't have movements yet:
```bash
cd backend/eunoia_backend
python trigger_movement_research.py
```

### Populate Test Data

Run the test charity registration script:
```bash
cd backend/eunoia_backend
python register_test_charities.py
```

This will:
- Create 10 diverse test charities
- Trigger movement research for each (if website URL provided)
- Generate embeddings for semantic search

## Frontend Installation & Testing

### Installation

1. **Navigate to frontend directory**:
```bash
cd eunoia_web
```

2. **Install dependencies**:
```bash
npm install
```

3. **Set up Polkadot API**:
```bash
mkdir -p .papi/descriptors/dist
npx papi init
npx papi add dot -n polkadot
npx papi
```

4. **Configure backend API URL**:

Create `.env` file in `eunoia_web/`:
```bash
REACT_APP_API_BASE_URL=http://127.0.0.1:8000/api
```

### Running the Application

1. **Start development server**:
```bash
npm start
```

2. **Access the application**:
   - Open http://localhost:3000
   - Connect Polkadot wallet (e.g., Talisman, SubWallet)

### Manual Frontend Testing

Follow the [Compass Tutorial](../tutorial/compass-tutorial.md) for step-by-step testing:

1. **Test Compass Matching**:
   - Navigate to /donate → Click "Eunoia Compass"
   - Enter vision: "I want to help children in Africa get education"
   - Review matched movements and recommendations
   - Select charities and adjust allocations
   - Verify donation flow (don't submit unless testing on testnet)

2. **Test One-Link Registration**:
   - Navigate to /register-charity
   - Enter charity details including website URL
   - Submit form
   - Check backend for auto-generated profile and movements

3. **Test Charity Browsing**:
   - Navigate to /charities
   - Browse charity listings
   - Click on individual charities to view details
   - Verify movement display

### Frontend Build Testing

```bash
npm run build
```

Verify build output in `eunoia_web/build/` directory.

## Integration Testing

### End-to-End Workflow

1. **Register a charity with one-link**:
```bash
curl -X POST http://127.0.0.1:8000/api/charities/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Real Charity",
    "description": "Testing end-to-end",
    "aptos_wallet_address": "0xabcd...",
    "contact_email": "real@charity.org",
    "website_url": "https://www.charitywater.org"
  }'
```

2. **Wait for research to complete** (check logs or poll API)

3. **Verify charity profile was populated**:
```bash
curl "http://127.0.0.1:8000/api/charities/<id>/"
```

Expected: `tagline`, `keywords`, `category` populated

4. **Verify movements were discovered**:
```bash
curl "http://127.0.0.1:8000/api/movements/?charity=<id>"
```

Expected: Multiple movements with `embedding`, `source_urls`

5. **Test semantic matching against new charity**:
```bash
curl -X POST http://127.0.0.1:8000/api/compass/match/ \
  -H "Content-Type: application/json" \
  -d '{
    "query": "clean water access in developing countries",
    "top_k": 5
  }'
```

Expected: New charity's movements appear in results

### Running Tests from Root Directory

You can also run tests from the project root:

```bash
# Run all tests
python backend/eunoia_backend/manage.py test tests

# Run specific test modules
python backend/eunoia_backend/manage.py test tests.test_charity_registration
python backend/eunoia_backend/manage.py test tests.test_movements_research
python backend/eunoia_backend/manage.py test tests.test_compass_matching

# Run with coverage
cd backend/eunoia_backend
coverage run --source='.' manage.py test ../../tests
```

## Troubleshooting

### Common Issues

1. **ModuleNotFoundError: No module named 'agents'**
   - Solution: `pip install agents` or check requirements.txt

2. **OpenAI API errors**
   - Solution: Verify `OPENAI_API_KEY` in .env file
   - Note: Some tests use mocks and don't require real API key

3. **Database locked errors**
   - Solution: Close other Django processes accessing db.sqlite3
   - Or use PostgreSQL for production testing

4. **Frontend can't connect to backend**
   - Solution: Verify backend is running on port 8000
   - Check CORS settings in `backend/eunoia_backend/eunoia_backend/settings.py`

5. **Polkadot API errors in frontend**
   - Solution: Reinstall papi dependencies: `npx papi`
   - Check `.papi/descriptors/dist/` has generated files

### Test Failure Debugging

1. **Run tests with verbose output**:
```bash
cd backend/eunoia_backend
python manage.py test ../../tests --verbosity=2
```

2. **Run specific failing test**:
```bash
cd backend/eunoia_backend
python manage.py test ../../tests.test_charity_registration.CharityModelTests.test_create_charity_with_valid_data
```

3. **Check test database state**:
```bash
cd backend/eunoia_backend
python manage.py shell
>>> from main.models import Charity, Movement
>>> Charity.objects.all()
>>> Movement.objects.all()
```

## Continuous Integration

The project uses GitHub Actions for automated testing:
- Frontend: `.github/workflows/azure-static-web-apps-green-moss-0b96db80f.yml`
- Tests run on push to main branch
- Deployment triggered on successful build

## Expected Test Results

All unit tests should pass:
```
Ran 25 tests in X.XXs

OK
```

Test coverage should be comprehensive:
- **Charity Registration**: Model validation, forms, background research
- **Movement Research**: AI agents, embedding generation, website crawling
- **Compass Matching**: Semantic search, API endpoints, movement grouping

If tests fail, check:
1. All prerequisites installed
2. Environment variables set correctly
3. Database migrations applied
4. Mock patches configured correctly
5. Django settings module path updated for root-level execution

## Performance Benchmarks

Expected performance:
- Semantic matching: < 500ms for 100 movements
- Website crawling: < 10s for 6 pages
- Embedding generation: < 1s per text
- API response time: < 2s for Compass match

## Additional Resources

- [Compass Architecture](./compass/architecture.md)
- [API Reference](./compass/api.md)
- [Algorithm Details](./compass/algorithms.md)
- [Movement System](./compass/movements.md)
- [Unit Tests](../tests/)

