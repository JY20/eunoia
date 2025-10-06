# Contributing to Eunoia

Thank you for considering contributing to Eunoia! We welcome contributions from everyone who wishes to help improve our platform for transparent charitable giving.

## Code of Conduct

By participating in this project, you agree to abide by our code of conduct. Please be respectful, inclusive, and considerate in all interactions.

## How Can I Contribute?

### Reporting Bugs

If you find a bug, please create an issue on our GitHub repository with the following information:

- A clear, descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Environment information (browser, OS, etc.)

### Suggesting Features

We welcome feature suggestions! Please create an issue on our GitHub repository with:

- A clear, descriptive title
- A detailed description of the proposed feature
- Any relevant mockups or examples
- Why this feature would be beneficial to Eunoia users

### Pull Requests

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature-name`)
3. Make your changes
4. Run tests to ensure your changes don't break existing functionality
5. Commit your changes (`git commit -am 'Add new feature: your feature description'`)
6. Push to the branch (`git push origin feature/your-feature-name`)
7. Create a new Pull Request

## Development Setup

### Backend Setup

```bash
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

# Run backend server
python manage.py runserver  # Runs on http://127.0.0.1:8000
```

### Frontend Setup

```bash
cd eunoia_web
npm install
npm start  # Runs on http://localhost:3000
```

### Smart Contract Setup

#### Aptos (Move)

```bash
cd aptos_contracts
aptos move compile
aptos move test

# Deploy (requires funded account)
aptos move publish --named-addresses eunoia=<your_account_address>
```

#### Polkadot (ink!)

```bash
cd polkadot_contracts/eunoia
cargo contract build  # Produces .contract Wasm bundle
```

## Coding Standards

- Follow the existing code style and patterns
- Write clear, descriptive commit messages
- Add comments for complex logic
- Write tests for new features
- Update documentation when necessary

## Documentation

If you're adding new features or making significant changes, please update the relevant documentation:

- README.md for high-level changes
- Inline code documentation for implementation details
- Update any relevant tutorials or guides

## License

By contributing to Eunoia, you agree that your contributions will be licensed under the project's MIT License.
