from pydantic import BaseModel
from typing import List, Optional
from agents import Agent


class CharityProfile(BaseModel):
    tagline: Optional[str] = None
    summary: Optional[str] = None
    keywords: List[str] = []
    category: Optional[str] = None  # ENV/EDU/HEA/ANI/ART/HUM/COM/DIS/OTH
    country_of_operation: Optional[str] = None
    year_founded: Optional[int] = None
    contact_person: Optional[str] = None


CHARITY_PROFILE_PROMPT = """
You are a nonprofit research analyst. Given website crawl data for a charity, extract a concise profile.

OUTPUT:
- tagline: Short mission tagline.
- summary: Full summary describing what the charity does.
- keywords: 5-12 keywords representing focus areas.
- category: One of: ENV, EDU, HEA, ANI, ART, HUM, COM, DIS, OTH.
- country_of_operation: Country primarily associated with the charity.
- year_founded: Year if available.
- contact_person: If clearly stated.

Guidelines: Use only information supported by content; when inferred, keep it reasonable.
"""


charity_profile_agent = Agent(
    name="CharityProfileAgent",
    instructions=CHARITY_PROFILE_PROMPT,
    model="gpt-4.1",
    output_type=CharityProfile,
)


