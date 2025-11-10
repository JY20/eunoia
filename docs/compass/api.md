# Compass API Reference

## Endpoints

### POST /api/compass/match/

Matches user queries against charity movements using semantic search.

**Request**:
```json
{
    "query": "I want to help children in Africa get education",
    "top_k": 10
}
```

**Response**:
```json
{
    "query": "I want to help children in Africa get education",
    "grouped_matches": {
        "Charity Name": {
            "charity_id": 1,
            "charity_name": "Charity Name",
            "charity_description": "...",
            "movements": [
                {
                    "movement_id": 5,
                    "title": "Education Initiative",
                    "summary": "...",
                    "score": 0.87
                }
            ]
        }
    },
    "raw_matches": [
        {
            "movement_id": 5,
            "charity_name": "Charity Name",
            "title": "Education Initiative",
            "score": 0.87
        }
    ],
    "recommendations": {
        "top_recommendations": [
            {
                "movement_id": 5,
                "charity_name": "Charity Name",
                "movement_title": "Education Initiative",
                "reason": "Matches your focus on African children's education..."
            }
        ]
    }
}
```

**Implementation**: `api_views.CompassMatchView`
**Handler**: `match_top_movements_sync(query, top_k)`

---

### GET /api/charity-semantic-search/

Semantic search for charities (legacy endpoint, uses charity embeddings).

**Query Parameters**:
- `query` (required): Search query string

**Response**:
```json
{
    "matched_charities": [
        {
            "id": 1,
            "name": "Charity Name",
            "description": "...",
            "tagline": "...",
            ...
        }
    ],
    "combined_mission": "AI-generated resonating statement"
}
```

**Implementation**: `api_views.CharitySemanticSearchView`
**Handler**: `utils.enhance_query_and_search(query)`

---

### GET /api/charities/

List all charities (Django REST Framework ViewSet).

**Query Parameters**:
- `is_verified`: Filter by verification status
- `page_size`: Pagination size
- `page`: Page number

**Response**: Paginated list of `CharitySerializer` objects

**Implementation**: `api_views.CharityViewSet`

**Auto-triggers**: On charity create/update with `website_url`, automatically launches background research.

---

### GET /api/movements/

List all movements (Django REST Framework ViewSet).

**Query Parameters**: Standard DRF pagination

**Response**: List of `MovementSerializer` objects

**Implementation**: `api_views.MovementViewSet`

---

## Serializers

### CharitySerializer

**Fields**:
- `id`, `name`, `description`, `tagline`
- `category`, `category_display`, `keywords`
- `aptos_wallet_address`, `polkadot_wallet_address`
- `website_url`, `contact_email`, `logo_url`
- `date_registered`, `is_verified`
- `country_of_operation`, `year_founded`, `contact_person`

### MovementSerializer

**Fields**:
- `id`, `title`, `summary`, `slug`
- `category`, `geography`, `start_date`
- `source_urls`, `confidence_score`
- `charity`: Nested charity data
- `is_active`, `created_at`, `updated_at`

---

## Error Responses

**400 Bad Request**:
```json
{
    "error": "Missing 'query'"
}
```

**500 Internal Server Error**:
```json
{
    "error": "Error message"
}
```

