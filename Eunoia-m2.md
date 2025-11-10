# Milestone Delivery 📬


**The delivery is according to the official [milestone delivery guidelines](https://github.com/Polkadot-Fast-Grants/delivery/blob/master/delivery-guidelines.md).**  

* **Application Document:** https://github.com/Polkadot-Fast-Grants/apply/blob/master/applications/eunoia.md 
* **Milestone Number:** 2
* **DOT Payment Address:** 14EKWaAMCHwYLbXo5VjnXxZkmp9jzNu3VsqvYq4SdEiXtvZw

**Context** 

In this Milestone, we developed Compass (core AI feature), improved UX, and deployed both the frontend and backend of our web app.

You can try it here: https://github.com/JY20/eunoia/blob/polkadot-m2/tutorial/compass-tutorial.md

You can read the documentation here: https://github.com/JY20/eunoia/tree/polkadot-m2/docs/compass 

Compass has three functionalities:

1. **One-link charity registration**: Seamless charity onboarding process where charities can fill required information by simply pasting their website's URL. An AI agent automatically crawls the website, extracts profile information, and discovers active movements/initiatives.

2. **Charity Research**: Autonomous movement discovery system that gathers specific initiatives and programs from charity websites. The system uses AI agents to crawl websites, extract structured data, and generate vector embeddings for semantic matching.

3. **User-facing matching**: Retrieves compatible charities through semantic search. Users describe their vision in natural language, and Compass matches them with specific movements (not just charities) using cosine similarity on vector embeddings. The system explains why each movement was matched and automatically suggests donation allocations based on match scores. When relevant, users can see charity locations on an impact map.

**UX Improvements**: The matching flow is intuitive: users simply write what they believe in, and Eunoia handles the matching. Each recommendation includes a clear explanation of why it was matched. Users match with specific movements (e.g., "Education Initiative in Kenya" from "Education For All Foundation") rather than entire charities, enabling more granular giving. Donations are automatically split across selected charities based on match percentages, with users able to adjust individual amounts.

**Deliverables**


| Number | Deliverable | Link | Notes |
| ------------- | ------------- | ------------- |------------- |
| 0b. | Documentation | [docs/compass/](https://github.com/JY20/eunoia/tree/polkadot-m2/docs/compass) | Complete technical documentation covering architecture, API reference, algorithms, and movements system. Includes inline code documentation. |
| 0b. | Testing and Testing Guide | [tutorial/compass-tutorial.md](https://github.com/JY20/eunoia/blob/polkadot-m2/tutorial/compass-tutorial.md), [docs/TESTING_GUIDE.md](https://github.com/JY20/eunoia/blob/polkadot-m2/docs/TESTING_GUIDE.md) | Comprehensive guide with user tutorial for Compass and unit tests
| 3. | Compass AI Agent - Movement Discovery | [agents_sdk/charity_research_agents/](https://github.com/JY20/eunoia/tree/polkadot-m2/backend/eunoia_backend/agents_sdk/charity_research_agents) | AI agents for crawling charity websites, extracting profiles, and discovering movements. Includes `charity_profile_agent`, `movement_finder_agent`, and `CharityResearchManager`. |
| 3. | Compass AI Agent - Matching System | [agents_sdk/compass_matching_agents/](https://github.com/JY20/eunoia/tree/polkadot-m2/backend/eunoia_backend/agents_sdk/compass_matching_agents) | Semantic matching engine using cosine similarity on vector embeddings. Includes `movement_selector_agent` for top-3 recommendations with reasoning. |
| 3. | One-Link Charity Registration | [main/forms.py](https://github.com/JY20/eunoia/blob/polkadot-m2/backend/eunoia_backend/main/forms.py), [main/api_views.py](https://github.com/JY20/eunoia/blob/polkadot-m2/backend/eunoia_backend/main/api_views.py) | Automatic background research triggered when charities register with website URL. Integrated into `CharityViewSet` and `CharityRegistrationForm`. |
| 3. | Frontend Compass Integration | [eunoia_web/src/components/donate/](https://github.com/JY20/eunoia/tree/polkadot-m2/eunoia_web/src/components/donate), [eunoia_web/src/pages/DonatePage.js](https://github.com/JY20/eunoia/blob/polkadot-m2/eunoia_web/src/pages/DonatePage.js) | Complete user-facing implementation including vision prompt, AI processing view, charity results with movement recommendations, donation confirmation, and impact tracker. Includes impact map visualization. |
| Backend APIs | Compass Matching API | [main/api_views.py#CompassMatchView](https://github.com/JY20/eunoia/blob/polkadot-m2/backend/eunoia_backend/main/api_views.py#L162) | `POST /api/compass/match/` - Matches user queries against movements using semantic search. Returns grouped matches and top recommendations with reasoning. |
| Backend APIs | Semantic Search API | [main/api_views.py#CharitySemanticSearchView](https://github.com/JY20/eunoia/blob/polkadot-m2/backend/eunoia_backend/main/api_views.py#L109) | `GET /api/charity-semantic-search/` - Semantic search for charities using embeddings. Returns matched charities and combined mission statement. |
| Backend APIs | Charities API | [main/api_views.py#CharityViewSet](https://github.com/JY20/eunoia/blob/polkadot-m2/backend/eunoia_backend/main/api_views.py#L28) | `GET /api/charities/` - CRUD operations for charities. Auto-triggers background research on create/update with website URL. |
| Backend APIs | Movements API | [main/api_views.py#MovementViewSet](https://github.com/JY20/eunoia/blob/polkadot-m2/backend/eunoia_backend/main/api_views.py#L156) | `GET /api/movements/` - List all movements with pagination support. |

**Additional Information**

**Deployment Details**:
- **Frontend**: Deployed on Azure Static Web Apps via GitHub Actions CI/CD pipeline. Automatic deployment on push to main branch. Configuration: [.github/workflows/azure-static-web-apps-green-moss-0b96db80f.yml](https://github.com/JY20/eunoia/blob/polkadot-m2/.github/workflows/azure-static-web-apps-green-moss-0b96db80f.yml)
- **Backend**: Deployed on Render with persistent disk storage for SQLite database. Startup script handles migrations and test charity registration: [backend/eunoia_backend/startup.sh](https://github.com/JY20/eunoia/blob/polkadot-m2/backend/eunoia_backend/startup.sh)

**Implementation Notes**:
- This milestone was completed before Milestone 1, but the PR was closed and reopened for chronological ordering in the repository.
- Significant improvements were made beyond the original deliverables based on feedback from potential users, including:
  - Movement-based matching (granular matching vs. charity-level)
  - Impact map visualization for location-specific charities
  - Enhanced UX flow with clear explanations for each recommendation

**Next Steps**:  
We're building a Telegram bot!

