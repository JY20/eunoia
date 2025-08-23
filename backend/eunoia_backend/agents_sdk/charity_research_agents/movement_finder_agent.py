from pydantic import BaseModel, Field
from typing import List, Optional
from agents import Agent


class MovementData(BaseModel):
    title: str
    summary: Optional[str] = None
    category: Optional[str] = None
    geography: Optional[str] = None
    start_date: Optional[str] = None  # textual for now
    source_urls: List[str] = Field(default_factory=list)
    confidence_score: float = 0.0


MOVEMENT_FINDER_PROMPT = """
Identify up to 5 top movements/initiatives the charity is actively running based on the website crawl.

For each movement include:
- title
- summary
- category (free-form like children, refugees, environment, etc.)
- geography (country/region if available)
- start_date (YYYY or YYYY-MM if available)
- source_urls (list of in-domain URLs that substantiate it)
- confidence_score (0.0-1.0, lower if inferred)

Focus on recent/active initiatives, those with prominent pages or CTAs.
"""


class MovementAnalysisResult(BaseModel):
    movements: List[MovementData]


movement_finder_agent = Agent(
    name="MovementFinderAgent",
    instructions=MOVEMENT_FINDER_PROMPT,
    model="gpt-4.1",
    output_type=MovementAnalysisResult,
)


