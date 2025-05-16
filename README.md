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
- CORS + Image processing

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

### Prereqs
- Node.js, Python 3.8+, Git, Aptos wallet

### 🖥️ Backend
```bash
cd backend/eunoia_backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### 🧑‍🎨 Frontend
```bash
cd eunoia_web
npm install
npm start
```

### 🛠️ Contracts

**Aptos**
```bash
cd contract
aptos move compile
aptos move publish --named-addresses eunoia=<your-address>
```

**Polkadot**
```bash
cd polkadot_contracts/eunoia
cargo contract build
```

---

## 🔑 Admin + Functions

- `/register-charity`: Charity signup
- `/admin`: Verify orgs via Django Admin
- Donations auto-routed via smart contracts
- On-chain logs for every transaction

---

## 🤝 Want to Contribute?

```bash
git clone <repo>
git checkout -b feature/your-feature-name
# Make changes
git commit -am 'New feature'
git push origin feature/your-feature-name
# Open PR
```

---

## 🔗 Connect With Us

- 🌍 [Website](https://www.eunoia.work)
- 𝕏  [X](https://x.com/eunoia_give)
- 📱 [Telegram](https://t.me/+aDt6-_BdrTtjODMx)
- 💻 [GitHub](https://github.com/JY20/eunoia)
- 🎮 [Discord](https://discord.com/invite/CWYXFqyQe6)

---

> *Let’s fix giving. With agents, not middlemen.*

---

Would you like this version sent to you as a Markdown `.md` file or committed directly to your repo?