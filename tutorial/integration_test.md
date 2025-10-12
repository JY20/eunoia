# Eunoia Platform Tutorial

This tutorial will guide you through setting up and using the Eunoia platform, a transparent charity donation platform built on blockchain technology.

### Important Notes

- **Local Testing**: You can test the platform locally by donating to registered test charities.
- **Blockchain Network**:
  - **Default (Mainnet)**: The platform uses Polkadot mainnet by default, which transfers real DOT tokens.
  - **Contract Address**: The Polkadot smart contract is deployed at address `0xFeDaF0b1500381F9EeEa77840cBC090C26CF63CA`
  - **Test Network**: To use testnet DOT tokens instead, modify `config.js` in the `eunoia_web/src` directory:
    ```javascript
    // Uncomment this line for testnet:
    export const POLKADOT_NODE_URL = process.env.REACT_APP_POLKADOT_NODE_URL || 'wss://testnet-passet-hub.polkadot.io';
    
    // Comment out the mainnet configuration
    // export const POLKADOT_NODE_URL = process.env.REACT_APP_POLKADOT_NODE_URL || 'wss://polkadot-rpc.publicnode.com';
    ```

## Table of Contents

1. [Development Setup](#development-setup)
   - [Backend Setup](#backend-setup)
   - [Frontend Setup](#frontend-setup)
   - [Testing the Application](#testing-the-application)
2. [Getting Started](#getting-started)
3. [Connecting Your Wallet](#connecting-your-wallet)
   - [Polkadot Wallet](#polkadot-wallet)
4. [Making a Donation](#making-a-donation)

## Development Setup

This section will guide you through setting up the Eunoia platform for local development.

### Backend Setup

The Eunoia backend is built with Django and requires Python 3.8+.

1. **Clone the repository**
   ```bash
   git clone https://github.com/JY20/eunoia/tree/polkadot-m1
   cd eunoia
   git checkout polkadot-m1
   ```

2. **Set up a virtual environment**
   ```bash
   cd backend/eunoia_backend
   python -m venv venv
   ```

3. **Activate the virtual environment**
   - On Windows:
     ```bash
     venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

4. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

5. **Set up environment variables**
   Create a `.env` file in the `backend/eunoia_backend` directory with the following variables:
   Note: message the dev team (jimmyyan1337@gmail.com) if you don't have one
   ```
   OPENAI_API_KEY={your_openai_api_key}
   ```

6. **Run migrations**
   ```bash
   python manage.py migrate
   ```

7. **Create a superuser (optional)**
   ```bash
   python manage.py createsuperuser
   ```

8. **Load test charities (optional)**
   ```bash
   python register_test_charities.py
   ```

9. **Start the development server**
   ```bash
   python manage.py runserver 8080
   ```
   The backend will be available at http://localhost:8080/

## FAQ

### OPENAI_API_KEY
For the OPENAI_API_KEY, please send an email to jimmyyan1337@gmail.com to request this secret key.

### Common Errors

If you encounter this error:
```
(venv) ➜  eunoia_backend git:(polkadot-m1) python manage.py migrate
Traceback (most recent call last):
  File "../eunoia/backend/eunoia_backend/manage.py", line 11, in main
    from django.core.management import execute_from_command_line
ModuleNotFoundError: No module named 'django'

The above exception was the direct cause of the following exception:

Traceback (most recent call last):
  File "..//eunoia/backend/eunoia_backend/manage.py", line 22, in <module>
    main()
  File "../eunoia/backend/eunoia_backend/manage.py", line 13, in main
    raise ImportError(
ImportError: Couldn't import Django. Are you sure it's installed and available on your PYTHONPATH environment variable? Did you forget to activate a virtual environment?
```

Please run:
```bash
pip install django
```



### Frontend Setup

The Eunoia frontend is built with React.

1. **Navigate to the frontend directory**
   ```bash
   cd eunoia_web
   ```

2. **Install dependencies**
   ```bash
   npm install
   npx papi add dot -n polkadot
   npx papi
   ```

3. **Configure the API endpoint**
   
   Edit `src/config.js` to point to your backend server:
   ```javascript
   export const API_URL = 'http://localhost:8080/api';
   ```

4. **Start the development server**
   ```bash
   npm run start
   ```
   The frontend will be available at http://localhost:3000/

### Testing the Application

To ensure everything is working correctly:

1. **Backend Tests**
   ```bash
   cd backend/eunoia_backend
   python manage.py test
   ```

2. **Frontend Tests**
   ```bash
   cd eunoia_web
   npm test
   ```

3. **End-to-End Testing**
   
   With both frontend and backend servers running:
   
   - Visit http://localhost:3000 in your browser
   - Create an account or log in
   - Connect a wallet (you can use test wallets for Aptos and Polkadot)
   - Try the Compass AI feature to find charities
   - Test making a donation (the system will use test networks)

## Getting Started

## Connecting Your Wallet

### Polkadot Wallet
1. Click on "Connect Wallet" in the navigation bar
2. Select "Polkadot" from the network options
3. Choose your preferred Polkadot wallet extension
4. Select the account you wish to use and approve the connection

**Note:** The Polkadot smart contract is deployed at address `0xFeDaF0b1500381F9EeEa77840cBC090C26CF63CA`

## Making a Donation

1. Select a charity from your Compass matches or browse the directory
2. Click on the charity's profile to view details
3. Select your preferred donation amount
4. Choose your preferred blockchain network (Polkadot)
5. Click "Donate Now"
6. Confirm the transaction in your wallet
7. Wait for blockchain confirmation (typically a few seconds)
8. Receive confirmation of your successful donation

Thank you for using Eunoia to make transparent, impactful donations!
