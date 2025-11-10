# Movements System

## Overview

Movements represent specific initiatives, programs, or campaigns run by charities. They enable granular matching between donor intent and charity activities.

## Movement Discovery

### Process

1. **Website Crawling**
   - Crawls up to 6 pages from charity website
   - Extracts: titles, headings, content, meta descriptions
   - Domain-aware crawling to stay within charity domain

2. **AI Extraction**
   - Agent: `movement_finder_agent` (GPT-4.1)
   - Input: Crawled website pages
   - Output: Up to 5 movements per charity

3. **Movement Schema**
   ```python
   {
       "title": str,
       "summary": Optional[str],
       "category": Optional[str],
       "geography": Optional[str],
       "start_date": Optional[str],
       "source_urls": List[str],
       "confidence_score": float  # 0.0-1.0
   }
   ```

### Storage

**Model**: `main.models.Movement`

**Fields**:
- `charity`: ForeignKey to Charity
- `slug`: Unique per charity (auto-generated from title)
- `embedding`: Vector embedding of summary for semantic search
- `is_active`: Boolean flag
- `confidence_score`: Decimal(4,3)

**Constraints**:
- Unique: `(charity, slug)`
- Indexed: `is_active`, `embedding`

## Embedding Generation

Movements generate embeddings from their `summary` field:
- Empty summaries → no embedding
- Embeddings used for semantic matching against user queries
- Stored in JSONField as `List[float]`

## Matching Algorithm

**Location**: `agents_sdk/compass_matching_agents/manager.py`

**Function**: `match_top_movements_async(query: str, top_k: int) -> Dict`

**Steps**:
1. Generate query embedding
2. Fetch active movements with embeddings
3. Compute cosine similarity: `(query_vec @ movement_vecs.T) / (||query_vec|| * ||movement_vecs||)`
4. Select top K movements by similarity score
5. Group by charity
6. Return grouped matches + raw matches

**Filtering**:
- Only `is_active=True` movements
- Only movements with non-null embeddings
- Eager loading of related charity to avoid N+1 queries

## Movement Selection

**Agent**: `movement_selector_agent` (GPT-4.1)

**Input**: JSON string containing grouped matches + user query

**Output**: Top 3 movements with reasoning

**Schema**:
```python
{
    "top_recommendations": [
        {
            "movement_id": int,
            "charity_name": str,
            "movement_title": str,
            "reason": str  # 1-2 sentences explaining fit
        }
    ]
}
```

## Research Triggers

**Automatic**:
- Charity created with `website_url` → background research
- Charity updated with new `website_url` → background research

**Manual**:
- `research_charity_sync(charity_id, max_pages=6)` → synchronous research
- Django management command: `python manage.py research_charity <url>`

**Pre-deployment**:
- `register_test_charities.py` runs synchronous research to populate movements before deployment

