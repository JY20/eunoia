#!/bin/bash

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

# Register test charities
python register_test_charities.py

# Run backend server
python manage.py runserver  # Runs on http://127.0.0.1:8000