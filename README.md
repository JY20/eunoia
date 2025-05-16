## 👥 The Team

<p align="center">
  <img src="eunoia_web\src\assets\team_consensus_photo.jpg" alt="Eunoia Team at Consensus" width="100%" />
</p>

> **Randomly recruited on LinkedIn & Telegram. Perfectly balanced. Fully committed.**

| Name         | Role                               | Background                         |
|--------------|------------------------------------|-------------------------------------|
| **Randy**    | AI Engineer                        | McGill University                   |
| **Alex**     | Product Manager                    | University of Waterloo              |
| **Jimmy**    | Web3 Engineer & Quant              | McMaster University                 |
| **Alejandro**| AI, Full Stack & Cybersecurity     | University of Waterloo              |
| **Chelsea**  | Finance & Strategic Partnerships   | Columbia University                 |

- 💻 **Perfect mix:** Web3 × AI × Full-Stack × PM × Finance  
- 🌍 **8 languages spoken**  
- 🎯 **Startup + nonprofit experience**  
- 🤝 Bonded over Chick-Fil-A  
- 🧠 Built 12+ agents, smart contracts, and real-world impact tools


## 👥 EUNOIA - We're fixing Charity. 
<p align="center">
  <img src="eunoia_web\src\assets\Eunoia Logo.svg" alt="Eunoia Logo" width="220"/>
</p>

<p align="center">
  <img src="eunoia_web\src\assets\eunoia_hero_banner.jpg" alt="Eunoia Banner" width="100%" style="border-radius: 16px;"/>
</p>

<p align="center">
  <b>🧠 Full-Stack AI Agents</b><br>
  <b>💸 Charity without middlemen</b><br>
  <b>🔗 Multi-chain: Aptos + Polkadot</b><br>
  <b>🕵️ Track where your donation is going</b>
</p>

<!-- <p align="center">
  <img src="./logo_full_branding.jpg" alt="Eunoia Logo" width="300"/>
</p> -->

**Charity is broken. We’re fixing it.**

Eunoia is an agent-powered giving platform that brings **radical transparency** to philanthropy. Built initially on Aptos and now expanding to Polkadot, Eunoia tracks every penny from wallet → charity → real-world spend — all on-chain.

We eliminate middlemen, minimize fees, and restore trust in giving. With our optional **0.20% “Amplify Impact”** model, platform growth funds itself — not the charities.

---

## 💔 The Problem

> *"She robbed me of being a parent."* — Robyn, donor misled by a fraudulent agency

Stories like Robyn’s and Kelly’s are far too common: $10,000 sent to adopt a child, and the funds disappeared. Children went underfed, and $400,000 was misused.

- $7B+ lost every year to fraud, mismanagement, or opacity in the charity sector  
- Up to 5% fees taken by platforms like GoFundMe  
- 81% of donors **don’t trust nonprofits**

---

## 🧠 How Eunoia Works

**Traditional giving is built on trust in logos.  
Eunoia builds trust with data.**

Instead of slow, manual vetting, our smart AI agents — we call them **Compass** — scan, rank, and recommend causes aligned with your values. You just describe what matters to you. We handle the rest.

> **🧭 Real-time agents. Transparent donations. No spreadsheets. Just impact.**

---

## ✨ Key Features

- **🔮 Radical Transparency:** All donations and fund distributions recorded on-chain
- **🧭 AI-Powered Matching:** Agents match you with causes that fit your vision
- **🔄 Direct Giving:** Donations go straight to charities or individuals
- **⛓️ Multi-Chain Support:** Supports Aptos and Polkadot, expanding further
- **💸 Ultra Low Fees:** Minimal platform fees; 0.20% optional for growth
- **⏱️ Real-Time Impact:** Donors track their money’s impact immediately
- **👥 Advocate-Focused:** Enables small orgs, field workers, and missionaries
- **🔐 Secure + Verifiable:** Auditable smart contracts and verified charities
- **🎨 Intuitive UI/UX:** Easy for anyone to use — donors and charities alike

---

## 🛣️ What’s Next

- ✅ Launch on Mainnet  
- ✅ Onboard first 5 verified charities  
- ✅ Run $1,000+ in real donations, tracked end-to-end  
- 🔜 Expand to 10+ underfunded causes in East Africa & SE Asia  
- 🔜 Launch full-stack AI agent platform  
- 🤝 Partner with EasyA & Foundation Collective for on-ground campaigns

---

## 🌍 Backed by Builders

We've been supported by communities like **EasyA**, **Aptos Foundation**, **Polkadot Foundation**, and founders across the Web3 space.

---

## 🛠️ Tech Stack

### 💻 Frontend
- React (Hooks + Context API)
- React Router, Axios
- Material UI
- Aptos Wallet Adapter

### ⚙️ Backend
- Django + Django REST Framework
- SQLite / PostgreSQL-ready
- Django Admin for charity management

### 🔗 Blockchain
- **Aptos (Move-based smart contracts)**
- **Polkadot (ink! smart contracts)**

---

## 🧱 Architecture

**Frontend (React)**
- Browsing, wallet connection, donations  
- Talks to backend + blockchain directly

**Backend (Django)**
- Charity verification, API layer  
- Admin + content management

**Smart Contracts**
- One per chain (Aptos + Polkadot)  
- Handles donations, charity registry, history

**High-Level Compass Agent Architecture**

![Compass Agent Architecture](eunoia_web/src/assets/compass_architecture.png)

**Semantic Search Architecture**
![Semantic Search Architecture](eunoia_web\src\assets\semantic_search_architecture.svg)
---

## 🔍 Smart Contracts Overview

### 🟣 Aptos: `eunoia.move`
- Donations, registration, history, fund checks
- Immutable tracking via `DonateEvent` & `CharityRegisteredEvent`
- Deployed at:
```
0x3940277b22c1fe2c8631bdce9dbcf020c3b8240a5417fa13ac21d37860f88011
```

### 🐞 Polkadot: `eunoia2` (ink!)
- Built for Substrate-compatible chains
- Smart fund routing, history mapping, verified orgs
- ink! 6.0 upgrade ready

---

## 🔄 User Flow

1. User connects wallet & enters cause vision  
2. Agent matches causes, ranks them  
3. User donates → blockchain logs it  
4. Charity receives funds directly  
5. Donor tracks spend in real time  
6. Optional: Platform reinvests via 0.20% "Amplify Impact"  

---
## 🚀 Setup Guide

### 📦 Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Python 3.8+](https://www.python.org/downloads/)
- [Aptos CLI](https://aptos.dev/tools/aptos-cli/)
- [Rust toolchain](https://rustup.rs/)
- [cargo-contract](https://github.com/paritytech/cargo-contract) (for Polkadot)
- Git
- Aptos-compatible wallet (e.g. [Petra](https://petra.app/))

### ⚙️ Backend Setup

```bash
git clone <repo-url>
cd backend/eunoia_backend

# Create & activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Apply DB migrations
python manage.py migrate

# Create superuser (for Django Admin)
python manage.py createsuperuser

# Optional: Load test data
python create_charity.py

# Run backend server
python manage.py runserver  # Runs on http://127.0.0.1:8000
```

### 🧑‍🎨 Frontend Setup

```bash
cd ../../eunoia_web
npm install
npm start  # Runs on http://localhost:3000
```

### 🔗 Smart Contract Setup

#### 🟣 Aptos (Move)

```bash
cd contract
aptos move compile
aptos move test

# Deploy (requires funded account)
aptos move publish --named-addresses eunoia=<your_account_address>
```

#### 🐞 Polkadot (ink!)

```bash
cd polkadot_contracts/eunoia
cargo contract build  # Produces .contract Wasm bundle
```

---

## 🔑 Admin + Functions

- `/register-charity`: Public charity registration form
- `/admin`: Django admin panel for verifying and managing charities
- Donations: Triggered via frontend → smart contract
- Blockchain logging: All transfers & verifications logged via events

---

## 📚 Appendix: Technical Extras

### 🧠 Agent System – Compass

Our agent stack is designed around **modularity**, with each Compass agent specializing in a single task:

- 🔍 Search agents: query hundreds of causes
- 🧾 Vetting agents: verify credibility
- 🧠 Matching agents: align values with charities
- 📊 Feedback agents: update donor dashboards
- 💬 Language agents: translate or clarify data

Each agent is orchestrated using async pipelines and can be extended or replaced easily. Prompting strategies are version-controlled.

---

### 🔎 Semantic Search

We use hybrid embeddings (BM25 + dense) to match user vision prompts to verified cause profiles.

- 🧠 Vector backend: FAISS + SQLite
- 🔤 Language model: OpenAI + fine-tuned fallback (GPT 3.5-turbo-1106)
- 🧰 Preprocessing: Text cleaning, keyword expansion
- 🔄 Retraining pipeline: Auto-updates based on cause metadata and user trends

---

### 🔐 Contract Security Features

Both **Aptos** and **Polkadot** contracts include:

- ✅ Admin-gated charity registration
- ✅ Balance + overflow checks
- ✅ Event logs for all user activity
- ✅ Modular upgrade support (Move module / Ink! modularity)
- ✅ View-only history + query functions

---

## 🤝 Want to Contribute?

```bash
git clone <repo-url>
git checkout -b feature/your-feature-name
# Make changes
git commit -am "Your description"
git push origin feature/your-feature-name
# Then open a Pull Request
```

---

## 🔗 Connect With Us

- 🌍 [Website](https://www.eunoia.work)
- 📱 [Telegram](https://t.me/+aDt6-_BdrTtjODMx)
- 💻 [GitHub](https://github.com/JY20/eunoia)
- 🎮 [Discord](https://discord.com/invite/CWYXFqyQe6)
- 𝕏 [Twitter/X](https://x.com/eunoia_give)

---

> *Let’s fix giving. With agents, not middlemen.*