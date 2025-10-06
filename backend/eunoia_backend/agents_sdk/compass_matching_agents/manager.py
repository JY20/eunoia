from __future__ import annotations

import asyncio
from typing import Any, Dict, List, Tuple

import numpy as np
from asgiref.sync import sync_to_async

from agents import Runner
from .selector_agent import movement_selector_agent, CompassRecommendationList
from main.models import Movement, Charity
from main.utils import get_embedding


def _group_matches_by_charity(matches: List[Tuple[Movement, float]]) -> Dict[str, Dict[str, Any]]:
    grouped: Dict[str, Dict[str, Any]] = {}
    for movement, score in matches:
        charity = movement.charity
        entry = grouped.setdefault(charity.name, {
            'charity_id': charity.id,
            'charity_name': charity.name,
            'charity_description': charity.description or '',
            'movements': []
        })
        entry['movements'].append({
            'movement_id': movement.id,
            'title': movement.title,
            'summary': movement.summary or '',
            'score': float(score),
        })
    return grouped


async def _match_top_movements_async(query: str, top_k: int = 10) -> Dict[str, Any]:
    query_emb = await sync_to_async(get_embedding)(query)
    if not query_emb:
        return {
            'query': query,
            'grouped_matches': {},
            'raw_matches': [],
        }

    # Fetch active movements with embeddings
    # Evaluate queryset with related charity eagerly loaded to avoid DB hits in async context
    def _load_movements():
        return list(
            Movement.objects
            .filter(is_active=True, embedding__isnull=False)
            .select_related('charity')
        )
    movements = await sync_to_async(_load_movements)()
    valid: List[Movement] = []
    all_embeddings: List[List[float]] = []
    for m in movements:
        if isinstance(m.embedding, list) and len(m.embedding) > 0 and all(isinstance(v, (int, float)) for v in m.embedding):
            valid.append(m)
            all_embeddings.append(m.embedding)

    if not valid:
        return {'query': query, 'grouped_matches': {}, 'raw_matches': []}

    query_np = np.array(query_emb).reshape(1, -1)
    mov_np = np.array(all_embeddings)
    sims = (query_np @ mov_np.T) / (np.linalg.norm(query_np) * np.linalg.norm(mov_np, axis=1))
    sims = sims.flatten()

    k = min(top_k, len(valid))
    top_idx = np.argsort(sims)[-k:][::-1]
    matches = [(valid[i], float(sims[i])) for i in top_idx]
    grouped = _group_matches_by_charity(matches)

    return {
        'query': query,
        'grouped_matches': grouped,
        'raw_matches': [
            {
                'movement_id': m.id,
                'charity_name': m.charity.name,
                'title': m.title,
                'score': score,
            } for m, score in matches
        ],
    }


async def _select_top_recommendations(payload: Dict[str, Any]) -> CompassRecommendationList:
    json_string = __import__('json').dumps(payload)
    result = await Runner.run(movement_selector_agent, json_string)
    return result.final_output_as(CompassRecommendationList)


async def match_top_movements(query: str, top_k: int = 10) -> Dict[str, Any]:
    payload = await _match_top_movements_async(query, top_k)
    if not payload.get('grouped_matches'):
        return {**payload, 'recommendations': {'top_recommendations': []}}
    recs = await _select_top_recommendations(payload)
    # Ensure JSON serializable structure
    return {**payload, 'recommendations': recs.model_dump()}


def match_top_movements_sync(query: str, top_k: int = 10) -> Dict[str, Any]:
    loop = asyncio.new_event_loop()
    try:
        return loop.run_until_complete(match_top_movements(query, top_k))
    finally:
        loop.close()


