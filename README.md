# Eunoia - Unchained Giving. Borderless Impact.

<!-- Add your logo_full_branding.jpg here -->
<!-- <p align="center">
  <img src="./logo_full_branding.jpg" alt="Eunoia Logo" width="300"/>
</p> -->

## Executive Summary

Eunoia is a radically transparent, advocate-centered giving platform built on the Aptos blockchain. We enable givers to track every penny from wallet → charity → spend in real-time. With an optional 0.20% "Amplify Impact" surcharge, Eunoia powers a self-funding marketing engine that grows the platform without burdening charities or donors.

Eunoia also aims to eliminate unnecessary middlemen, enabling donations to reach individuals directly—like missionaries or independent charity workers in developing countries—with full transparency and minimal fees.

## The Problem Eunoia Solves

Traditional charitable giving often suffers from a lack of transparency, high intermediary fees, and delays in funds reaching the intended recipients. Donors are left wondering about the true impact of their contributions. Eunoia tackles these issues by leveraging the power of blockchain technology.

## Key Features

*   **Radical Transparency:** All donations and fund distributions are recorded on the Aptos blockchain, providing an immutable and publicly verifiable ledger.
*   **Direct Giving:** Minimize intermediaries, allowing funds to flow more directly to charities and individuals on the ground.
*   **Low Fees:** Significantly reduced transaction costs compared to traditional financial systems.
*   **Real-time Tracking:** Donors can see the journey of their funds.
*   **Advocate-Centered:** Empowering individual charity workers and smaller organizations.
*   **Optional Impact Surcharge:** A novel mechanism (0.20%) to fund platform growth and marketing, ensuring sustainability without directly charging donors or charities excessively.
*   **Secure Platform:** Built with robust backend and frontend technologies, leveraging the security of the Aptos network.
*   **User-Friendly Interface:** A modern, intuitive UI/UX for both donors and charities.

## Technology Stack

*   **Frontend (`eunoia_web`):**
    *   React (with Hooks and Context API)
    *   React Router for navigation
    *   Material UI (MUI) for UI components and styling
    *   Axios for API communication
    *   Aptos Wallet Adapter for wallet interactions
*   **Backend (`eunoia_backend`):**
    *   Django (Python web framework)
    *   Django REST Framework (for building APIs)
    *   Django ORM with SQLite (for development, configurable for PostgreSQL in production)
    *   Pillow for image processing
    *   `django-cors-headers` for Cross-Origin Resource Sharing
*   **Blockchain:**
    *   Aptos Network
    *   Move for smart contracts (developed by a separate team member)

## Project Architecture Overview

Eunoia operates with a decoupled frontend and backend architecture:

1.  **Frontend (React App - `@eunoia_web`):**
    *   Handles all user interactions, including browsing charities, connecting Aptos wallets, and initiating donations.
    *   Communicates with the Django backend via REST APIs to fetch charity information, user data (future), and potentially submit registration details.
    *   Interacts directly with the Aptos blockchain via the Aptos Wallet Adapter for donation transactions and smart contract calls.

2.  **Backend (Django App - `@eunoia_backend`):**
    *   Manages charity data: registration, verification, storing details like name, description, Aptos wallet address, and official documents.
    *   Provides RESTful API endpoints for the frontend to consume (e.g., list charities, charity details, featured charities).
    *   Handles administrative tasks, including charity verification via the Django Admin interface.
    *   Manages static and media files (logos, registration documents).

3.  **Aptos Smart Contract:**
    *   (Managed by a teammate) Contains the core logic for receiving donations and distributing them to charities according to predefined rules.
    *   Ensures the transparent and automated handling of funds on the blockchain.

**Interaction Flow (Simplified Donation):**

*   User browses charities on the React frontend (data fetched from Django API).
*   User connects their Aptos wallet.
*   User selects a charity and initiates a donation.
*   React frontend interacts with the Aptos smart contract (via wallet adapter) to execute the donation transaction.
*   Transaction is recorded on the Aptos blockchain.
*   (Future) Backend might listen to blockchain events or periodically query the contract to update donation records.

## Setup and Installation Guide

### Prerequisites

*   Node.js and npm (or Yarn)
*   Python 3.8+
*   Pip (Python package installer)
*   Git
*   An Aptos-compatible wallet (e.g., Petra Wallet browser extension)

### Backend Setup (`eunoia_backend`)

1.  **Clone the repository (if you haven't already):**
    ```bash
    git clone <repository-url>
    cd eunoia
    ```

2.  **Navigate to the backend directory:**
    ```bash
    cd backend/eunoia_backend
    ```

3.  **Create and activate a Python virtual environment:**
    ```bash
    python -m venv venv
    # On Windows
    .\venv\Scripts\activate
    # On macOS/Linux
    source venv/bin/activate
    ```

4.  **Install Python dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

5.  **Apply database migrations:**
    ```bash
    python manage.py migrate
    ```

6.  **Create a superuser (for Django Admin access):**
    ```bash
    python manage.py createsuperuser
    ```
    (Follow the prompts to set username, email, and password)

7.  **(Optional) Load initial sample data (if a script is provided, e.g., `create_charity.py`):**
    ```bash
    python create_charity.py
    ```

8.  **Start the Django development server:**
    ```bash
    python manage.py runserver
    ```
    The backend API will be available at `http://localhost:8000/api/`
    The Django Admin interface will be accessible at `http://localhost:8000/admin/`

### Frontend Setup (`eunoia_web`)

1.  **Navigate to the frontend directory from the project root:**
    ```bash
    cd eunoia_web 
    # (If you are in backend/eunoia_backend, use: cd ../../eunoia_web)
    ```

2.  **Install Node.js dependencies:**
    ```bash
    npm install
    # or if you use Yarn
    # yarn install
    ```

## Running the Application

1.  **Start the Django Backend Server:**
    *   Navigate to `backend/eunoia_backend`.
    *   Ensure your virtual environment is activated.
    *   Run: `python manage.py runserver`
    *   The backend will typically run on `http://localhost:8000`.
    *   The Django Admin will be accessible at `http://localhost:8000/admin/`.

2.  **Start the React Frontend Development Server:**
    *   Navigate to `eunoia_web`.
    *   Run: `npm start` (or `yarn start`)
    *   The frontend will typically run on `http://localhost:3000` and open automatically in your browser.

## Key Functionalities Explained

### Charity Registration
*   Charities can navigate to the `/register-charity` (or a similar route) on the frontend.
*   This form will eventually submit data to a Django backend API endpoint.
*   Currently, charity registration and initial data input are primarily managed via the Django templates (`/register-charity/` on the backend) and the Django Admin interface (`/admin/main/charity/add/`).
*   Admins can verify charities through the Django Admin panel.

### Donation Process
*   Users connect their Aptos wallet (e.g., Petra) via the frontend.
*   They browse verified charities (data served by the Django API).
*   When a user decides to donate, the frontend interacts with the Aptos smart contract, guided by the selected charity's Aptos wallet address.
*   The transaction occurs directly on the Aptos blockchain.

### Transparency
*   **On-Chain Transactions:** All donations are blockchain transactions, inherently public and verifiable on an Aptos explorer.
*   **Verified Charities:** The backend maintains a list of charities, and admins can verify their legitimacy. Only verified charities are displayed for donation.
*   **Direct Fund Flow (Goal):** The architecture aims to send funds as directly as possible to the charity's registered Aptos wallet, as managed by the smart contract.

## Contributing

We welcome contributions! If you'd like to contribute, please follow these steps:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature-name`).
3.  Make your changes.
4.  Commit your changes (`git commit -am 'Add some feature'`).
5.  Push to the branch (`git push origin feature/your-feature-name`).
6.  Create a new Pull Request.

(Please ensure your code adheres to any linting and style guidelines if established.)

## License

(Specify your chosen license here, e.g., MIT License, Apache 2.0. If unsure, MIT is a common permissive license.)

```
This project is licensed under the MIT License - see the LICENSE.md file for details.
```

---

*This README provides a comprehensive overview. For more detailed information on specific components, please refer to the respective frontend and backend documentation or code comments where available.*