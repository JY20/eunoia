from pydantic import BaseModel
from typing import List
from agents import Agent


class CompassRecommendation(BaseModel):
    movement_id: int
    charity_name: str
    movement_title: str
    reason: str


class CompassRecommendationList(BaseModel):
    top_recommendations: List[CompassRecommendation]


SELECTION_PROMPT = """
You are Compass, an assistant that helps donors choose where to donate.

You will receive a JSON string that groups matched movements by charity. Your job:
1) Read the JSON and understand the user's intent from the provided 'query'.
2) Select the top 3 movements that best fit the user's intent, balancing impact, relevance, and clarity.
3) For each recommendation, return a brief reason (1-2 sentences) citing the movement's fit.

Respond with the structured schema only.
"""


movement_selector_agent = Agent(
    name="CompassMovementSelector",
    instructions=SELECTION_PROMPT,
    model="gpt-4.1",
    output_type=CompassRecommendationList,
)


