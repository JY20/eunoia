# Eunoia - Onchained Giving. Borderless Impact.

<!-- Add your logo_full_branding.jpg here -->
<!-- <p align="center">
  <img src="./logo_full_branding.jpg" alt="Eunoia Logo" width="300"/>
</p> -->

Eunoia is a radically transparent, advocate-centered giving platform built on the Aptos blockchain. We enable givers to track every penny from wallet → charity → spend in real-time. With an optional 0.20% "Amplify Impact" surcharge, Eunoia powers a self-funding marketing engine that grows the platform without burdening charities or donors.

Eunoia also aims to eliminate unnecessary middlemen, enabling donations to reach individuals directly—like missionaries or independent charity workers in developing countries—with full transparency and minimal fees.

---

## 🔍 The Problem Eunoia Solves

Traditional charitable giving often suffers from a lack of transparency, high intermediary fees, and delays in funds reaching the intended recipients. Donors are left wondering about the true impact of their contributions. Eunoia tackles these issues by leveraging the power of blockchain technology.

---

## ✨ Key Features

*   **🔮 Radical Transparency:** All donations and fund distributions are recorded on the Aptos blockchain, providing an immutable and publicly verifiable ledger.
*   **🔄 Direct Giving:** Minimize intermediaries, allowing funds to flow more directly to charities and individuals on the ground.
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
*   Aptos Network
*   Move for smart contracts

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

### 3️⃣ Aptos Smart Contract
*   Contains the core logic for receiving donations and distributing them to charities according to predefined rules.
*   Ensures the transparent and automated handling of funds on the blockchain.

---

## 📘 Smart Contract Details

The Eunoia platform is powered by a Move smart contract system deployed on the Aptos blockchain. These contracts handle the core donation logic, charity registration, and fund distribution in a transparent and secure manner.

### 🔐 Smart Contract Structure (`eunoia.move`)

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

### 🌐 Contract Deployment

The smart contract is configured in `contract/Move.toml` and deployed to the Aptos network at address:
```
0x3940277b22c1fe2c8631bdce9dbcf020c3b8240a5417fa13ac21d37860f88011
```

---

## 🔄 Interaction Flow

1. User browses charities on the React frontend (data fetched from Django API).
2. User connects their Aptos wallet.
3. User selects a charity and initiates a donation.
4. React frontend interacts with the Aptos smart contract (via wallet adapter) to execute the donation transaction.
5. Transaction is recorded on the Aptos blockchain.
6. (Future) Backend might listen to blockchain events or periodically query the contract to update donation records.

---

## 🚀 Setup and Installation Guide

### Prerequisites

*   Node.js and npm (or Yarn)
*   Python 3.8+
*   Pip (Python package installer)
*   Git
*   An Aptos-compatible wallet (e.g., Petra Wallet browser extension)

### Backend Setup (`eunoia_backend`)

1. **Clone the repository (if you haven't already):**  
git clone <repository-url>  
cd eunoia
2. **Navigate to the backend directory:**  
cd backend/eunoia_backend
3. **Create and activate a Python virtual environment:**  
python -m venv venv  
# On Windows  
.\venv\Scripts\activate  
# On macOS/Linux  
source venv/bin/activate
4. **Install Python dependencies:**  
pip install -r requirements.txt
5. **Apply database migrations:**  
python manage.py migrate
6. **Create a superuser (for Django Admin access):**  
python manage.py createsuperuser  
(Follow the prompts to set username, email, and password)
7. **(Optional) Load initial sample data (if a script is provided, e.g., `create_charity.py`):**  
python create_charity.py
8. **Start the Django development server:**  
python manage.py runserver  
The backend API will be available at `http://localhost:8000/api/`  
The Django Admin interface will be accessible at `http://localhost:8000/admin/`

### Frontend Setup (`eunoia_web`)

1. **Navigate to the frontend directory from the project root:**  
cd eunoia_web  
# (If you are in backend/eunoia_backend, use: cd ../../eunoia_web)
2. **Install Node.js dependencies:**  
npm install  
# or if you use Yarn  
# yarn install

### Smart Contract Setup (Optional for Developers)

1. **Install Aptos CLI:**  
Follow instructions at [https://aptos.dev/tools/aptos-cli/](https://aptos.dev/tools/aptos-cli/)
2. **Navigate to the contract directory:**  
cd contract
3. **Compile the Move contract:**  
aptos move compile
4. **Test the contract (if test modules exist):**  
aptos move test
5. **Deploy the contract (requires Aptos account with funds):**  
aptos move publish --named-addresses eunoia=<your-account-address>

## Running the Application

1. **Start the Django Backend Server:**  
   * Navigate to `backend/eunoia_backend`.  
   * Ensure your virtual environment is activated.  
   * Run: `python manage.py runserver`  
   * The backend will typically run on `http://localhost:8000`.  
   * The Django Admin will be accessible at `http://localhost:8000/admin/`.
2. **Start the React Frontend Development Server:**  
   * Navigate to `eunoia_web`.  
   * Run: `npm start` (or `yarn start`)  
   * The frontend will typically run on `http://localhost:3000` and open automatically in your browser.

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
*   When a user decides to donate, the frontend interacts with the Aptos smart contract, guided by the selected charity's Aptos wallet address.
*   The transaction occurs directly on the Aptos blockchain.

### 👁️ Transparency
*   **On-Chain Transactions:** All donations are blockchain transactions, inherently public and verifiable on an Aptos explorer.
*   **Verified Charities:** The backend maintains a list of charities, and admins can verify their legitimacy. Only verified charities are displayed for donation.
*   **Direct Fund Flow (Goal):** The architecture aims to send funds as directly as possible to the charity's registered Aptos wallet, as managed by the smart contract.

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