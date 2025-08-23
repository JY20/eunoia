from pydantic import BaseModel
from typing import List, Dict, Optional
from agents import Agent

# Specific Pydantic models for structured data
class BrandColors(BaseModel):
    """Brand color scheme"""
    primary: Optional[str] = None
    secondary: Optional[str] = None
    accent: Optional[str] = None

class BrandFonts(BaseModel):
    """Brand font preferences"""
    primary: Optional[str] = None
    secondary: Optional[str] = None
    heading: Optional[str] = None

class SocialMediaAccounts(BaseModel):
    """Social media account URLs"""
    facebook: Optional[str] = None
    instagram: Optional[str] = None
    twitter: Optional[str] = None
    linkedin: Optional[str] = None
    youtube: Optional[str] = None
    tiktok: Optional[str] = None
    pinterest: Optional[str] = None

# Pydantic models matching the Company database model
class CompanyData(BaseModel):
    """Extracted company information matching the Company database model"""
    
    # Basic company info
    name: str
    industry: str  # Should match INDUSTRY_CHOICES
    size: str  # Should match COMPANY_SIZE_CHOICES
    description: str
    website: str
    
    # Brand Guidelines
    brand_voice: str
    brand_values: str
    brand_colors: BrandColors
    brand_fonts: BrandFonts
    
    # Business Goals
    primary_goals: List[str]  # List of main business objectives
    target_audience: str
    unique_value_proposition: str
    
    # Additional extracted data
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    social_media_accounts: SocialMediaAccounts
    
    # Analysis confidence
    confidence_score: float  # 0.0 to 1.0

COMPANY_ANALYSIS_PROMPT = """
You are an expert business analyst specializing in extracting comprehensive company information from website content.

Your task is to analyze the provided website crawl data and extract structured company information that matches the following categories:

**INDUSTRY CATEGORIES (choose the best match):**
- saas (SaaS/Technology)
- ecommerce (E-commerce)
- healthcare (Healthcare)
- finance (Finance)
- education (Education)
- manufacturing (Manufacturing)
- retail (Retail)
- services (Professional Services)
- nonprofit (Non-profit)
- other (Other)

**COMPANY SIZE CATEGORIES (estimate based on content/team pages/about us):**
- startup (1-10 employees)
- small (11-50 employees)
- medium (51-200 employees)
- large (201-1000 employees)
- enterprise (1000+ employees)

**BRAND VOICE ANALYSIS:**
Analyze the tone, style, and personality of the company's communication. Look for:
- Formal vs. informal language
- Technical vs. accessible explanations
- Friendly vs. authoritative tone
- Conservative vs. innovative positioning

**BRAND VALUES EXTRACTION:**
Look for explicitly stated values, mission statements, or inferred values from:
- About us pages
- Mission/vision statements
- Company culture descriptions
- How they describe their approach

**BRAND COLORS:**
Extract brand colors and provide them in the following structure:
- primary: Main brand color (hex code like #2563eb)
- secondary: Secondary brand color (hex code)
- accent: Accent or highlight color (hex code)

Look for colors in:
- CSS styling analysis
- Logo colors mentioned
- Design themes
- Color schemes used throughout the site

**BRAND FONTS:**
Extract font information and provide in this structure:
- primary: Main body font
- secondary: Secondary/alternative font
- heading: Font used for headings

**BUSINESS GOALS:**
Identify primary objectives from content like:
- Mission statements
- Service offerings
- Marketing messages
- Call-to-action buttons
- Headlines and value propositions

**TARGET AUDIENCE:**
Determine who the company serves based on:
- Language and tone used
- Services/products offered
- Case studies or testimonials
- Industry focus
- Pricing and positioning

**UNIQUE VALUE PROPOSITION:**
Extract what makes this company different:
- Competitive advantages mentioned
- Unique features or approaches
- Specialized expertise
- Market positioning statements

**SOCIAL MEDIA ACCOUNTS:**
Extract social media URLs and provide in this structure:
- facebook: Full Facebook URL
- instagram: Full Instagram URL
- twitter: Full Twitter/X URL
- linkedin: Full LinkedIn URL
- youtube: Full YouTube URL
- tiktok: Full TikTok URL
- pinterest: Full Pinterest URL

Be thorough but only extract information that is clearly supported by the website content. If information is not available or unclear, use reasonable business analysis to make educated inferences, but note lower confidence.

For colors and fonts, if not explicitly stated, make reasonable inferences based on the overall design theme and typical industry conventions.

Provide a confidence_score between 0.0 and 1.0 based on how much concrete information was available vs. inferred.
"""

company_analysis_agent = Agent(
    name="CompanyAnalysisAgent",
    instructions=COMPANY_ANALYSIS_PROMPT,
    model="gpt-4o-mini",
    output_type=CompanyData,
) 