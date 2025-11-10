"""
Unit tests for Compass matching functionality.

Tests cover:
- Semantic matching algorithm
- Movement selection
- Grouping by charity
- API endpoints
"""

import os
import django
from unittest.mock import patch, MagicMock
from django.test import TestCase
from rest_framework.test import APIClient
from backend.eunoia_backend.main.models import Charity, Movement
import numpy as np


class SemanticMatchingTests(TestCase):
    """Test semantic matching algorithm."""
    
    def setUp(self):
        """Set up test data with charities and movements."""
        self.charity1 = Charity.objects.create(
            name='Education Foundation',
            description='Providing education',
            aptos_wallet_address='0x' + 'a' * 64,
            contact_email='edu@charity.org',
            is_verified=True,
        )
        
        self.charity2 = Charity.objects.create(
            name='Health Initiative',
            description='Healthcare services',
            aptos_wallet_address='0x' + 'b' * 64,
            contact_email='health@charity.org',
            is_verified=True,
        )
        
        # Create movements with embeddings
        self.movement1 = Movement.objects.create(
            charity=self.charity1,
            title='School Building Program',
            slug='school-building',
            summary='Building schools in Africa',
            embedding=[0.8, 0.6, 0.0] * 512,  # Mock embedding
            is_active=True,
        )
        
        self.movement2 = Movement.objects.create(
            charity=self.charity1,
            title='Teacher Training',
            slug='teacher-training',
            summary='Training teachers',
            embedding=[0.7, 0.5, 0.1] * 512,
            is_active=True,
        )
        
        self.movement3 = Movement.objects.create(
            charity=self.charity2,
            title='Medical Clinic',
            slug='medical-clinic',
            summary='Providing healthcare',
            embedding=[0.1, 0.2, 0.9] * 512,
            is_active=True,
        )
    
    @patch('main.utils.get_embedding')
    def test_match_movements_by_similarity(self, mock_embedding):
        """Test matching movements by cosine similarity."""
        # Mock query embedding similar to education movements
        query_embedding = [0.75, 0.55, 0.05] * 512
        mock_embedding.return_value = query_embedding
        
        from backend.eunoia_backend.agents_sdk.compass_matching_agents import match_top_movements_sync
        
        result = match_top_movements_sync(
            query="I want to help education in Africa",
            top_k=3
        )
        
        self.assertIn('grouped_matches', result)
        self.assertIn('raw_matches', result)
        
        # Verify education movements ranked higher
        raw_matches = result['raw_matches']
        self.assertGreater(len(raw_matches), 0)
        
        # First match should be education-related
        top_match = raw_matches[0]
        self.assertIn('education', top_match['title'].lower() + top_match['charity_name'].lower())
    
    @patch('main.utils.get_embedding')
    def test_filtering_active_movements_only(self, mock_embedding):
        """Test that only active movements are matched."""
        # Create inactive movement
        inactive_movement = Movement.objects.create(
            charity=self.charity1,
            title='Inactive Program',
            slug='inactive',
            summary='Old program',
            embedding=[0.8, 0.6, 0.0] * 512,
            is_active=False,  # Inactive
        )
        
        mock_embedding.return_value = [0.8, 0.6, 0.0] * 512
        
        from backend.eunoia_backend.agents_sdk.compass_matching_agents import match_top_movements_sync
        
        result = match_top_movements_sync(query="test", top_k=10)
        
        # Verify inactive movement is not in results
        movement_ids = [m['movement_id'] for m in result['raw_matches']]
        self.assertNotIn(inactive_movement.id, movement_ids)
    
    @patch('main.utils.get_embedding')
    def test_filtering_movements_without_embeddings(self, mock_embedding):
        """Test that movements without embeddings are excluded."""
        # Create movement without embedding
        no_embedding_movement = Movement.objects.create(
            charity=self.charity1,
            title='No Embedding',
            slug='no-embedding',
            summary='Test',
            embedding=None,  # No embedding
            is_active=True,
        )
        
        mock_embedding.return_value = [0.5] * 1536
        
        from backend.eunoia_backend.agents_sdk.compass_matching_agents import match_top_movements_sync
        
        result = match_top_movements_sync(query="test", top_k=10)
        
        # Verify movement without embedding is excluded
        movement_ids = [m['movement_id'] for m in result['raw_matches']]
        self.assertNotIn(no_embedding_movement.id, movement_ids)


class MovementGroupingTests(TestCase):
    """Test grouping movements by charity."""
    
    def setUp(self):
        """Set up test data."""
        self.charity = Charity.objects.create(
            name='Multi-Program Charity',
            description='Multiple programs',
            aptos_wallet_address='0x' + 'a' * 64,
            contact_email='multi@charity.org',
        )
        
        self.movements = [
            Movement.objects.create(
                charity=self.charity,
                title=f'Program {i}',
                slug=f'program-{i}',
                summary=f'Description {i}',
                embedding=[i * 0.1] * 1536,
                is_active=True,
            )
            for i in range(3)
        ]
    
    def test_group_movements_by_charity(self):
        """Test that movements are grouped by charity."""
        from backend.eunoia_backend.agents_sdk.compass_matching_agents.manager import _group_matches_by_charity
        
        matches = [(movement, 0.9 - i * 0.1) for i, movement in enumerate(self.movements)]
        
        grouped = _group_matches_by_charity(matches)
        
        self.assertEqual(len(grouped), 1)  # One charity
        self.assertIn('Multi-Program Charity', grouped)
        
        charity_data = grouped['Multi-Program Charity']
        self.assertEqual(charity_data['charity_id'], self.charity.id)
        self.assertEqual(len(charity_data['movements']), 3)


class MovementSelectionTests(TestCase):
    """Test AI-powered movement selection."""
    
    @patch('agents_sdk.compass_matching_agents.manager.Runner.run')
    async def test_select_top_recommendations(self, mock_runner):
        """Test selecting top 3 recommendations with reasoning."""
        # Mock AI agent response
        mock_result = MagicMock()
        mock_result.final_output_as.return_value = MagicMock(
            top_recommendations=[
                MagicMock(
                    movement_id=1,
                    charity_name='Education Foundation',
                    movement_title='School Building Program',
                    reason='Directly addresses education needs in Africa',
                ),
                MagicMock(
                    movement_id=2,
                    charity_name='Education Foundation',
                    movement_title='Teacher Training',
                    reason='Ensures sustainable education quality',
                ),
                MagicMock(
                    movement_id=3,
                    charity_name='Community Center',
                    movement_title='Youth Programs',
                    reason='Provides extracurricular learning',
                ),
            ]
        )
        mock_runner.return_value = mock_result
        
        from agents_sdk.compass_matching_agents.selector_agent import CompassRecommendationList
        
        result = mock_result.final_output_as(CompassRecommendationList)
        
        self.assertEqual(len(result.top_recommendations), 3)
        self.assertEqual(result.top_recommendations[0].movement_id, 1)
        self.assertIn('education', result.top_recommendations[0].reason.lower())


class CompassAPITests(TestCase):
    """Test Compass API endpoints."""
    
    def setUp(self):
        """Set up test data and API client."""
        self.client = APIClient()
        
        charity = Charity.objects.create(
            name='Test Charity',
            description='Test',
            aptos_wallet_address='0x' + 'a' * 64,
            contact_email='test@charity.org',
            is_verified=True,
        )
        
        Movement.objects.create(
            charity=charity,
            title='Test Movement',
            slug='test-movement',
            summary='Test description',
            embedding=[0.5] * 1536,
            is_active=True,
        )
    
    @patch('main.utils.get_embedding')
    @patch('agents_sdk.compass_matching_agents.manager.Runner.run')
    def test_compass_match_api_endpoint(self, mock_runner, mock_embedding):
        """Test POST /api/compass/match/ endpoint."""
        mock_embedding.return_value = [0.5] * 1536
        
        # Mock recommendation selection
        mock_result = MagicMock()
        mock_result.final_output_as.return_value = MagicMock(
            top_recommendations=[
                MagicMock(
                    movement_id=1,
                    charity_name='Test Charity',
                    movement_title='Test Movement',
                    reason='Test reason',
                )
            ]
        )
        mock_runner.return_value = mock_result
        
        response = self.client.post(
            '/api/compass/match/',
            {
                'query': 'I want to help education',
                'top_k': 10
            },
            format='json'
        )
        
        self.assertEqual(response.status_code, 200)
        self.assertIn('grouped_matches', response.data)
        self.assertIn('raw_matches', response.data)
        self.assertIn('recommendations', response.data)
    
    def test_compass_match_api_missing_query(self):
        """Test API returns error when query is missing."""
        response = self.client.post(
            '/api/compass/match/',
            {'top_k': 10},  # Missing 'query'
            format='json'
        )
        
        self.assertEqual(response.status_code, 400)
        self.assertIn('error', response.data)


if __name__ == '__main__':
    import sys
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.eunoia_backend.eunoia_backend.settings')
    django.setup()
    
    from django.test.utils import get_runner
    from django.conf import settings
    
    TestRunner = get_runner(settings)
    test_runner = TestRunner()
    failures = test_runner.run_tests(['tests.test_compass_matching'])
    sys.exit(bool(failures))

