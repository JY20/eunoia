# Compass Algorithms

## Semantic Matching Algorithm

### Overview

Compass uses cosine similarity on vector embeddings to match user queries against charity movements.

### Embedding Generation

**Input**: Text string (query or movement summary)

**Process**:
1. Call OpenAI embeddings API (`text-embedding-3-small`)
2. Receive 1536-dimensional vector
3. Normalize vector: `v / ||v||`

**Function**: `main.utils.get_embedding(text: str) -> List[float]`

### Similarity Computation

**Location**: `agents_sdk/compass_matching_agents/manager.py`

**Algorithm**:
```python
query_vec = np.array(query_embedding).reshape(1, -1)  # Shape: (1, 1536)
movement_vecs = np.array([m.embedding for m in movements])  # Shape: (N, 1536)

# Cosine similarity: dot product / (norm(query) * norm(movements))
similarities = (query_vec @ movement_vecs.T) / (
    np.linalg.norm(query_vec) * np.linalg.norm(movement_vecs, axis=1)
)
```

**Output**: Array of similarity scores (0.0 to 1.0)

**Selection**: Top K movements by score (descending)

### Time Complexity

- Embedding generation: O(1) API call per text
- Similarity computation: O(N × D) where N = movements, D = embedding dimension (1536)
- Top-K selection: O(N log K) using `np.argsort`

**Optimization**: Pre-computed embeddings stored in database, only query embedding generated at runtime.

---

## Movement Grouping Algorithm

**Location**: `agents_sdk/compass_matching_agents/manager.py`

**Function**: `_group_matches_by_charity(matches: List[Tuple[Movement, float]])`

**Process**:
1. Iterate through (movement, score) pairs
2. Group by `movement.charity.name`
3. Aggregate movements per charity with scores
4. Return dictionary: `{charity_name: {charity_id, movements: [...]}}`

**Output Structure**:
```python
{
    "Charity Name": {
        "charity_id": int,
        "charity_name": str,
        "charity_description": str,
        "movements": [
            {
                "movement_id": int,
                "title": str,
                "summary": str,
                "score": float
            }
        ]
    }
}
```

---

## AI Selection Algorithm

**Agent**: `movement_selector_agent` (GPT-4.1)

**Input**: JSON string containing:
- User query
- Grouped matches by charity
- Raw movement matches with scores

**Process**:
1. Agent analyzes user intent from query
2. Evaluates movements against intent
3. Selects top 3 movements balancing:
   - Relevance to query
   - Impact potential
   - Clarity of mission
4. Generates reasoning for each selection

**Output**: `CompassRecommendationList` with top 3 movements + reasons

**Prompt**: See `agents_sdk/compass_matching_agents/selector_agent.py`

---

## Website Crawling Algorithm

**Location**: `agents_sdk/charity_research_agents/utils.py`

**Function**: `smart_website_crawler(url: str, max_pages: int = 6) -> CrawledWebsiteData`

**Process**:
1. Start from root URL
2. Extract links within same domain
3. Prioritize: homepage, about, programs, initiatives pages
4. Crawl up to `max_pages` (default: 6)
5. Extract per page:
   - Title, meta description
   - Headings (H1-H6)
   - Main content text
   - URL

**Output**: `CrawledWebsiteData` with list of page objects

**Limitations**:
- Domain-bound (stays within charity domain)
- Max pages: 6 (configurable)
- No JavaScript rendering (static HTML only)

---

## Embedding Storage Strategy

**Charity Embeddings**:
- Generated from: `description + tagline + keywords`
- Updated when: charity created/updated with website research
- Stored in: `Charity.embedding` (JSONField)

**Movement Embeddings**:
- Generated from: `summary` field
- Updated when: movement created/updated
- Stored in: `Movement.embedding` (JSONField)
- Filtered: Only movements with embeddings participate in matching

**Null Handling**:
- Missing embeddings → excluded from semantic search
- Fallback: Keyword-based search (if implemented)

