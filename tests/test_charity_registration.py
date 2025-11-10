"""
Unit tests for charity registration functionality.

Tests cover:
- Charity model creation and validation
- Registration form validation
- One-link registration with website URL
- Background research triggering
"""

import os
import django
from unittest.mock import patch, MagicMock
from django.test import TestCase, TransactionTestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from backend.eunoia_backend.main.models import Charity, Movement
from backend.eunoia_backend.main.forms import CharityRegistrationForm


class CharityModelTests(TestCase):
    """Test Charity model creation and validation."""
    
    def setUp(self):
        """Set up test data."""
        self.valid_charity_data = {
            'name': 'Test Charity',
            'description': 'A test charity for unit testing',
            'aptos_wallet_address': '0x' + 'a' * 64,
            'contact_email': 'test@charity.org',
            'website_url': 'https://www.testcharity.org',
            'is_verified': True,
        }
    
    def test_create_charity_with_valid_data(self):
        """Test creating a charity with valid data."""
        charity = Charity.objects.create(**self.valid_charity_data)
        
        self.assertEqual(charity.name, 'Test Charity')
        self.assertEqual(charity.contact_email, 'test@charity.org')
        self.assertTrue(charity.is_verified)
        self.assertIsNotNone(charity.date_registered)
    
    def test_charity_string_representation(self):
        """Test __str__ method returns charity name."""
        charity = Charity.objects.create(**self.valid_charity_data)
        self.assertEqual(str(charity), 'Test Charity')
    
    def test_charity_without_website_url(self):
        """Test creating charity without website URL."""
        data = self.valid_charity_data.copy()
        data.pop('website_url')
        
        charity = Charity.objects.create(**data)
        self.assertIsNone(charity.website_url)
    
    def test_charity_category_choices(self):
        """Test charity category field accepts valid choices."""
        data = self.valid_charity_data.copy()
        
        # Test valid categories
        valid_categories = ['ENV', 'EDU', 'HEA', 'ANI', 'ART', 'HUM', 'COM', 'DIS', 'OTH']
        for category in valid_categories:
            data['category'] = category
            charity = Charity.objects.create(**data)
            self.assertEqual(charity.category, category)
            charity.delete()
    
    def test_charity_embedding_storage(self):
        """Test that embeddings can be stored as JSON."""
        charity = Charity.objects.create(**self.valid_charity_data)
        
        # Store sample embedding
        sample_embedding = [0.1, 0.2, 0.3, 0.4, 0.5]
        charity.embedding = sample_embedding
        charity.save()
        
        # Reload from database
        charity.refresh_from_db()
        self.assertEqual(charity.embedding, sample_embedding)
    
    def test_charity_keywords_storage(self):
        """Test that keywords can be stored as JSON."""
        charity = Charity.objects.create(**self.valid_charity_data)
        
        keywords = ['education', 'children', 'africa']
        charity.keywords = keywords
        charity.save()
        
        charity.refresh_from_db()
        self.assertEqual(charity.keywords, keywords)


class CharityRegistrationFormTests(TestCase):
    """Test charity registration form validation."""
    
    def test_form_with_valid_data(self):
        """Test form validation with valid data."""
        form_data = {
            'name': 'Test Charity',
            'description': 'A test charity',
            'aptos_wallet_address': '0x' + 'a' * 64,
            'website_url': 'https://www.testcharity.org',
            'contact_email': 'test@charity.org',
        }
        
        form = CharityRegistrationForm(data=form_data)
        self.assertTrue(form.is_valid())
    
    def test_form_missing_required_fields(self):
        """Test form validation with missing required fields."""
        form_data = {
            'name': 'Test Charity',
            # Missing other required fields
        }
        
        form = CharityRegistrationForm(data=form_data)
        self.assertFalse(form.is_valid())
        self.assertIn('aptos_wallet_address', form.errors)
        self.assertIn('contact_email', form.errors)
    
    def test_form_invalid_email(self):
        """Test form validation with invalid email."""
        form_data = {
            'name': 'Test Charity',
            'description': 'A test charity',
            'aptos_wallet_address': '0x' + 'a' * 64,
            'contact_email': 'invalid-email',
        }
        
        form = CharityRegistrationForm(data=form_data)
        self.assertFalse(form.is_valid())
        self.assertIn('contact_email', form.errors)
    
    def test_form_with_logo_upload(self):
        """Test form with logo file upload."""
        form_data = {
            'name': 'Test Charity',
            'description': 'A test charity',
            'aptos_wallet_address': '0x' + 'a' * 64,
            'website_url': 'https://www.testcharity.org',
            'contact_email': 'test@charity.org',
        }
        
        # Create a simple test image
        logo = SimpleUploadedFile(
            "test_logo.png",
            b"fake image content",
            content_type="image/png"
        )
        
        form = CharityRegistrationForm(data=form_data, files={'logo': logo})
        self.assertTrue(form.is_valid())


class CharityResearchTriggerTests(TransactionTestCase):
    """Test that charity research is triggered on creation/update."""
    
    @patch('main.forms.launch_charity_research_in_background')
    def test_research_triggered_on_form_save_with_url(self, mock_research):
        """Test that research is triggered when charity has website_url."""
        form_data = {
            'name': 'Test Charity',
            'description': 'A test charity',
            'aptos_wallet_address': '0x' + 'a' * 64,
            'website_url': 'https://www.testcharity.org',
            'contact_email': 'test@charity.org',
        }
        
        form = CharityRegistrationForm(data=form_data)
        self.assertTrue(form.is_valid())
        
        charity = form.save()
        
        # Verify research was triggered
        mock_research.assert_called_once_with(charity.id, max_pages=6)
    
    @patch('main.forms.launch_charity_research_in_background')
    def test_research_not_triggered_without_url(self, mock_research):
        """Test that research is not triggered without website_url."""
        form_data = {
            'name': 'Test Charity',
            'description': 'A test charity',
            'aptos_wallet_address': '0x' + 'a' * 64,
            'contact_email': 'test@charity.org',
        }
        
        form = CharityRegistrationForm(data=form_data)
        self.assertTrue(form.is_valid())
        
        charity = form.save()
        
        # Verify research was NOT triggered
        mock_research.assert_not_called()
    
    @patch('main.api_views.launch_charity_research_in_background')
    def test_research_triggered_via_api_create(self, mock_research):
        """Test that research is triggered when creating via API."""
        from rest_framework.test import APIClient
        
        client = APIClient()
        
        data = {
            'name': 'API Test Charity',
            'description': 'Created via API',
            'aptos_wallet_address': '0x' + 'b' * 64,
            'website_url': 'https://www.apicharity.org',
            'contact_email': 'api@charity.org',
        }
        
        response = client.post('/api/charities/', data, format='json')
        
        self.assertEqual(response.status_code, 201)
        
        # Verify research was triggered
        charity_id = response.data['id']
        mock_research.assert_called_with(charity_id, max_pages=6)


class MovementModelTests(TestCase):
    """Test Movement model functionality."""
    
    def setUp(self):
        """Set up test data."""
        self.charity = Charity.objects.create(
            name='Test Charity',
            description='A test charity',
            aptos_wallet_address='0x' + 'a' * 64,
            contact_email='test@charity.org',
        )
    
    def test_create_movement(self):
        """Test creating a movement."""
        movement = Movement.objects.create(
            charity=self.charity,
            title='Education Initiative',
            slug='education-initiative',
            summary='Providing education to children',
            category='education',
            geography='Kenya',
            confidence_score=0.95,
            is_active=True,
        )
        
        self.assertEqual(movement.title, 'Education Initiative')
        self.assertEqual(movement.charity, self.charity)
        self.assertTrue(movement.is_active)
    
    def test_movement_unique_slug_per_charity(self):
        """Test that slug is unique per charity."""
        Movement.objects.create(
            charity=self.charity,
            title='Education Initiative',
            slug='education-initiative',
            summary='First initiative',
        )
        
        # Creating another movement with same slug for same charity should fail
        from django.db import IntegrityError
        with self.assertRaises(IntegrityError):
            Movement.objects.create(
                charity=self.charity,
                title='Education Initiative 2',
                slug='education-initiative',  # Same slug
                summary='Second initiative',
            )
    
    def test_movement_embedding_storage(self):
        """Test that movement embeddings can be stored."""
        movement = Movement.objects.create(
            charity=self.charity,
            title='Health Program',
            slug='health-program',
            summary='Providing healthcare services',
        )
        
        embedding = [0.1, 0.2, 0.3, 0.4, 0.5]
        movement.embedding = embedding
        movement.save()
        
        movement.refresh_from_db()
        self.assertEqual(movement.embedding, embedding)
    
    def test_movement_source_urls_storage(self):
        """Test that source URLs can be stored as JSON."""
        movement = Movement.objects.create(
            charity=self.charity,
            title='Water Initiative',
            slug='water-initiative',
            summary='Clean water access',
        )
        
        urls = [
            'https://charity.org/water-program',
            'https://charity.org/impact',
        ]
        movement.source_urls = urls
        movement.save()
        
        movement.refresh_from_db()
        self.assertEqual(movement.source_urls, urls)
    
    def test_movement_string_representation(self):
        """Test __str__ method."""
        movement = Movement.objects.create(
            charity=self.charity,
            title='Test Movement',
            slug='test-movement',
        )
        
        expected = f"Test Movement ({self.charity.name})"
        self.assertEqual(str(movement), expected)


if __name__ == '__main__':
    import sys
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.eunoia_backend.eunoia_backend.settings')
    django.setup()
    
    from django.test.utils import get_runner
    from django.conf import settings
    
    TestRunner = get_runner(settings)
    test_runner = TestRunner()
    failures = test_runner.run_tests(['tests.test_charity_registration'])
    sys.exit(bool(failures))

