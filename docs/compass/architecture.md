# Compass Architecture

## Overview

Compass is Eunoia's AI-powered matching system that connects donors with compatible charities through semantic analysis of user queries and charity movements.

## Components

### 1. Charity Research Pipeline

**Location**: `backend/eunoia_backend/agents_sdk/charity_research_agents/`

**Components**:
- `CharityResearchManager`: Orchestrates research workflow
- `charity_profile_agent`: Extracts charity metadata from website content
- `movement_finder_agent`: Identifies active movements/initiatives
- `utils.py`: Website crawling utilities

**Flow**:
1. Website crawl → `smart_website_crawler()` extracts up to 6 pages
2. Profile extraction → `charity_profile_agent` processes crawled content
3. Movement discovery → `movement_finder_agent` identifies initiatives
4. Embedding generation → Vector embeddings created for semantic search
5. Database persistence → Results stored in `Charity` and `Movement` models

### 2. Matching Pipeline

**Location**: `backend/eunoia_backend/agents_sdk/compass_matching_agents/`

**Components**:
- `manager.py`: Semantic matching and recommendation logic
- `selector_agent.py`: AI-powered top-3 movement selection

**Flow**:
1. Query embedding → User query converted to vector
2. Cosine similarity → Match against movement embeddings
3. Grouping → Results grouped by charity
4. Selection → `movement_selector_agent` picks top 3 movements
5. Response → Structured recommendations returned

### 3. API Layer

**Location**: `backend/eunoia_backend/main/api_views.py`

**Endpoints**:
- `POST /api/compass/match/`: Main matching endpoint
- `GET /api/charity-semantic-search/`: Semantic charity search
- `GET /api/charities/`: Charity CRUD operations
- `GET /api/movements/`: Movement listing

## Data Models

### Charity
- `embedding`: JSONField storing vector embedding (description + tagline + keywords)
- `extracted_text_data`: Raw website content (max 15KB)
- `keywords`: JSONField of extracted keywords

### Movement
- `embedding`: JSONField storing vector embedding of summary
- `charity`: ForeignKey to Charity
- `is_active`: Boolean flag for filtering
- Unique constraint: `(charity, slug)`

## Embedding Generation

**Function**: `main.utils.get_embedding(text: str) -> List[float]`

- Uses OpenAI embeddings API
- Model: `text-embedding-3-small` (default)
- Dimensions: 1536
- Normalized for cosine similarity

## Background Processing

**One-Link Registration**:
- Triggered on charity creation/update when `website_url` present
- Runs asynchronously via `launch_charity_research_in_background()`
- Thread-based execution (daemon thread)

**Synchronous Research**:
- `research_charity_sync()`: Blocking call for pre-deployment population
- Used in `register_test_charities.py` to ensure movements exist before deployment

