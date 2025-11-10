# Compass Documentation

Compass is Eunoia's AI-powered matching system that connects donors with compatible charities through semantic analysis.

## Documentation Index

- **[Architecture](./architecture.md)**: System architecture and component overview
- **[Movements](./movements.md)**: Movement discovery, storage, and matching
- **[API Reference](./api.md)**: REST API endpoints and schemas
- **[Algorithms](./algorithms.md)**: Core algorithms and computational details

## Quick Start

### Matching a Query

```python
from agents_sdk.compass_matching_agents import match_top_movements_sync

result = match_top_movements_sync(
    query="I want to help children in Africa get education",
    top_k=10
)
```

### Researching a Charity

```python
from agents_sdk import research_charity_sync

result = research_charity_sync(
    charity_id=1,
    max_pages=6
)
```

## Key Concepts

**Movements**: Specific initiatives or programs run by charities. Movements enable granular matching between donor intent and charity activities.

**Embeddings**: Vector representations of text (queries, charity descriptions, movement summaries) used for semantic similarity computation.

**Semantic Matching**: Cosine similarity computation between query embeddings and movement embeddings to find the best matches.

## Commit Reference

Latest implementation: `c90f043` (Merge pull request #7)

