# Eunoia - Onchained Giving. Borderless Impact.

<!-- Add your logo_full_branding.jpg here -->
<!-- <p align="center">
  <img src="./logo_full_branding.jpg" alt="Eunoia Logo" width="300"/>
</p> -->

Eunoia is a radically transparent, advocate-centered giving platform built initially on the Aptos blockchain, and now expanding to be a **multi-chain solution supporting both Aptos and Polkadot**. We enable givers to track every penny from wallet → charity → spend in real-time. With an optional 0.20% "Amplify Impact" surcharge, Eunoia powers a self-funding marketing engine that grows the platform without burdening charities or donors.

Eunoia also aims to eliminate unnecessary middlemen, enabling donations to reach individuals directly—like missionaries or independent charity workers in developing countries—with full transparency and minimal fees.

---

## 🔍 The Problem Eunoia Solves

Traditional charitable giving often suffers from a lack of transparency, high intermediary fees, and delays in funds reaching the intended recipients. Donors are left wondering about the true impact of their contributions. Eunoia tackles these issues by leveraging the power of blockchain technology.

---

## ✨ Key Features

*   **🔮 Radical Transparency:** All donations and fund distributions are recorded on-chain, providing an immutable and publicly verifiable ledger on their respective blockchains.
*   **🔄 Direct Giving:** Minimize intermediaries, allowing funds to flow more directly to charities and individuals on the ground.
*   **⛓️ Multi-Chain Support:** Currently supports Aptos and Polkadot, with the flexibility to expand to other networks.
*   **💰 Low Fees:** Significantly reduced transaction costs compared to traditional financial systems.
*   **⏱️ Real-time Tracking:** Donors can see the journey of their funds.
*   **👥 Advocate-Centered:** Empowering individual charity workers and smaller organizations.
*   **🚀 Optional Impact Surcharge:** A novel mechanism (0.20%) to fund platform growth and marketing, ensuring sustainability without directly charging donors or charities excessively.
*   **🔒 Secure Platform:** Built with robust backend and frontend technologies, leveraging the security of the Aptos network.
*   **🎨 User-Friendly Interface:** A modern, intuitive UI/UX for both donors and charities.

---

## 🛠️ Technology Stack

### 💻 Frontend (`eunoia_web`)
*   React (with Hooks and Context API)
*   React Router for navigation
*   Material UI (MUI) for UI components and styling
*   Axios for API communication
*   Aptos Wallet Adapter for wallet interactions

### ⚙️ Backend (`eunoia_backend`)
*   Django (Python web framework)
*   Django REST Framework (for building APIs)
*   Django ORM with SQLite (for development, configurable for PostgreSQL in production)
*   Pillow for image processing
*   `django-cors-headers` for Cross-Origin Resource Sharing

### 🔗 Blockchain
*   **Aptos Network**
    *   Move for smart contracts
*   **Polkadot Network (via parachains/smart contract platforms)**
    *   ink! (Rust-based eDSL) for smart contracts

---

## 🏗️ System Architecture Overview

Eunoia operates with a decoupled frontend and backend architecture:

### 1️⃣ Frontend (React App - `@eunoia_web`)
*   Handles all user interactions, including browsing charities, connecting Aptos wallets, and initiating donations.
*   Communicates with the Django backend via REST APIs to fetch charity information, user data (future), and potentially submit registration details.
*   Interacts directly with the Aptos blockchain via the Aptos Wallet Adapter for donation transactions and smart contract calls.

### 2️⃣ Backend (Django App - `@eunoia_backend`)
*   Manages charity data: registration, verification, storing details like name, description, Aptos wallet address, and official documents.
*   Provides RESTful API endpoints for the frontend to consume (e.g., list charities, charity details, featured charities).
*   Handles administrative tasks, including charity verification via the Django Admin interface.
*   Manages static and media files (logos, registration documents).

### 3️⃣ Smart Contracts
*   **Aptos Smart Contract:** Contains the core logic for receiving donations and distributing them to charities on the Aptos network.
*   **Polkadot Smart Contract:** Provides similar donation and charity management functionalities on Polkadot-compatible chains using ink!.

---

## 📘 Smart Contract Details

The Eunoia platform utilizes smart contracts on both the Aptos and Polkadot networks to handle core donation logic, charity registration, and fund distribution transparently and securely.

### 🔐 Aptos Smart Contract Details (`eunoia.move`)

Located in `contract/sources/eunoia.move`, our contract implements the following key functionalities:

#### Core Resources and Tables
* `ContractData`: Main resource storing donation histories, charity wallets, and raised amounts
* `HistoryEntry`: Records individual donation details including charity, coin type, amount and timestamp
* Tables structure to efficiently store and retrieve donation and charity data

#### Key Functions
* `initialize_module`: Sets up the contract data structures
* `add_charity`: Registers a new charity with its wallet address
* `donate<CoinType>`: Processes donations of different coin types to registered charities
* `get_donation_history`: View function to retrieve a user's donation history
* `get_charity_raised_amount`: View function to check total raised by a charity per coin type
* `get_charity_wallet`: View function to retrieve a charity's wallet address

#### Events
* `DonateEvent`: Emitted when donations are made for transparent tracking
* `CharityRegisteredEvent`: Emitted when a new charity is registered

#### Security Features
* Comprehensive error handling
* Access control with module owner verification
* Checks to prevent unauthorized operations
* Balance validations before transfers

### 🌐 Contract Deployment (Aptos)

The smart contract is configured in `contract/Move.toml` and deployed to the Aptos network at address:
```
0x3940277b22c1fe2c8631bdce9dbcf020c3b8240a5417fa13ac21d37860f88011
```

### 🦀 Polkadot (ink!) Smart Contract Details (`eunoia2` module)

Located in `polkadot_contracts/eunoia/lib.rs`, our ink! smart contract provides donation and charity management functionalities for the Polkadot ecosystem. It's designed to be deployed on Substrate-based chains that support `pallet-contracts`.

#### Core Storage Items
*   `owner`: The `AccountId` (or `H160` for ink! 6+) of the contract administrator.
*   `histories`: A `Mapping` from a donor's account to a `Vec` of their `HistoryEntry` structs.
*   `charity_wallets`: A `Mapping` from a charity's name (String) to their wallet `AccountId` (or `H160`).
*   `charity_raised_amounts`: A `Mapping` from a charity's name to a `BTreeMap` storing amounts raised per coin type (String to `U256` or `u128`).

#### Key Structs and Events
*   `HistoryEntry`: Struct recording details of each donation (charity, coin, amount, donor, timestamp).
*   `DonateEvent`: Emitted when a donation is successfully processed.
*   `CharityRegisteredEvent`: Emitted when a new charity is added.
*   `Error`: Enum defining possible error conditions within the contract.

#### Key Functions
*   `new()`: Constructor to initialize the contract, setting the caller as the owner.
*   `add_charity(charity_name: String, charity_wallet: AccountId)`: Allows the owner to register a new charity.
*   `donate(charity_name: String, coin_name: String)`: A payable message allowing users to donate native tokens to a registered charity.
*   `get_donation_history(donor: AccountId)`: View function to retrieve a donor's history.
*   `get_charity_raised_amount(charity_name: String, coin_name: String)`: View function to check amounts raised by a charity.
*   `get_charity_wallet(charity_name: String)`: View function to get a charity's registered wallet.

#### Security and Design Considerations
*   Owner-restricted administrative functions (e.g., `add_charity`).
*   Payable messages for donations.
*   Use of `Mapping` for efficient storage and retrieval.
*   Events for off-chain tracking and UI updates.
*   Currently under development for ink! 6.0, which involves updates to account types (e.g., `H160`) and value types (e.g., `U256`).

### 🌐 Contract Deployment (Polkadot)
Deployment of the ink! contract involves compiling it to a Wasm blob and a metadata file using `cargo-contract build`. This bundle can then be deployed to a compatible Substrate chain via UI tools like Polkadot-JS Apps or programmatically. The specific deployment address will vary based on the target network and deployment instance.

---

## 🔄 Interaction Flow

1. User browses charities on the React frontend (data fetched from Django API).
2. User connects their Aptos wallet.
3. User selects a charity and initiates a donation.
4. React frontend interacts with the appropriate smart contract (Aptos or Polkadot via respective wallet adapters/libraries) to execute the donation transaction.
5. Transaction is recorded on the respective blockchain.
6. (Future) Backend might listen to blockchain events or periodically query the contract to update donation records.

---

## 🚀 Setup and Installation Guide

### Prerequisites

* Node.js and npm
* Python 3.8+
* Pip (Python package installer)
* Git
* An Aptos-compatible wallet (e.g., Petra Wallet browser extension)

### Installation and Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd eunoia
   ```

2. **Backend Setup:**
   ```bash
   # Navigate to the backend directory
   cd backend/eunoia_backend
   
   # Create and activate a virtual environment
   python -m venv venv
   
   # On Windows
   .\venv\Scripts\activate
   
   # On macOS/Linux
   source venv/bin/activate
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Apply database migrations
   python manage.py migrate
   
   # Create a superuser for admin access
   python manage.py createsuperuser
   # Follow the prompts to set username, email, and password
   
   # (Optional) Load initial sample data if available
   python create_charity.py
   
   # Start the Django server
   python manage.py runserver
   ```
   The backend will be available at `http://localhost:8000/api/`  
   The admin interface will be accessible at `http://localhost:8000/admin/`

3. **Frontend Setup:**
   ```bash
   # Navigate to the frontend directory (from project root)
   cd eunoia_web
   
   # Install dependencies
   npm install
   
   # Start the development server
   npm start
   ```
   The frontend will be accessible at `http://localhost:3000`

4. **Smart Contract Development (Optional):**

   **Aptos (Move):**
   ```bash
   # Install Aptos CLI
   # Follow instructions at https://aptos.dev/tools/aptos-cli/
   
   # Navigate to Aptos contract directory
   cd contract 
   # (This was the original path, adjust if your Aptos contract is elsewhere)
   
   # Compile Move contract
   aptos move compile
   
   # Test the contract
   aptos move test
   
   # Deploy the contract (requires Aptos account with funds)
   aptos move publish --named-addresses eunoia=<your-account-address>
   ```

   **Polkadot (ink!):**
   ```bash
   # Install cargo-contract CLI
   # cargo install cargo-contract --force
   
   # Navigate to Polkadot contract directory
   cd polkadot_contracts/eunoia 
   # (Or polkadot_contracts/eunoia2 if that's the active one)
   
   # Build the ink! contract
   cargo contract build
   
   # (Testing typically uses `cargo test` within the contract crate)
   # (Deployment uses tools like Polkadot-JS Apps with the .contract file from target/ink)
   ```

---

## 🔑 Key Functionalities

### 📝 Charity Registration
*   Charities can navigate to the `/register-charity` (or a similar route) on the frontend.
*   This form will eventually submit data to a Django backend API endpoint.
*   Currently, charity registration and initial data input are primarily managed via the Django templates (`/register-charity/` on the backend) and the Django Admin interface (`/admin/main/charity/add/`).
*   Admins can verify charities through the Django Admin panel.

### 💸 Donation Process
*   Users connect their Aptos wallet (e.g., Petra) via the frontend.
*   They browse verified charities (data served by the Django API).
*   When a user decides to donate, the frontend interacts with the relevant smart contract (Aptos or Polkadot), guided by the selected charity's wallet address for the respective network.
*   The transaction occurs directly on the chosen blockchain.

### 👁️ Transparency
*   **On-Chain Transactions:** All donations are blockchain transactions, inherently public and verifiable on an Aptos explorer.
*   **Verified Charities:** The backend maintains a list of charities, and admins can verify their legitimacy. Only verified charities are displayed for donation.
*   **Direct Fund Flow (Goal):** The architecture aims to send funds as directly as possible to the charity's registered wallet, as managed by the smart contract.

---

## 🤝 Contributing

We welcome contributions! If you'd like to contribute, please follow these steps:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature-name`).
3.  Make your changes.
4.  Commit your changes (`git commit -am 'Add some feature'`).
5.  Push to the branch (`git push origin feature/your-feature-name`).
6.  Create a new Pull Request.

---

*This README provides a comprehensive overview. For more detailed information on specific components, please refer to the respective frontend and backend documentation or code comments where available.*