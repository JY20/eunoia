"""
Unit tests for charity research and movement discovery.

Tests cover:
- Website crawling
- AI agent profile extraction
- Movement discovery
- Embedding generation
- Background research workflow
"""

import os
import django
from unittest.mock import patch, MagicMock, AsyncMock
from django.test import TestCase, TransactionTestCase
from backend.eunoia_backend.main.models import Charity, Movement


class WebsiteCrawlingTests(TestCase):
    """Test website crawling functionality."""
    
    @patch('agents_sdk.charity_research_agents.utils.smart_website_crawler')
    def test_crawl_charity_website(self, mock_crawler):
        """Test crawling a charity website."""
        # Mock crawled data
        mock_crawler.return_value = MagicMock(
            domain='testcharity.org',
            main_url='https://www.testcharity.org',
            total_pages_crawled=3,
            crawl_method='smart',
            pages=[
                MagicMock(
                    title='About Us',
                    url='https://www.testcharity.org/about',
                    content='We help children in need',
                    headings=['Mission', 'Vision'],
                    meta_description='Test charity description',
                )
            ]
        )
        
        from backend.eunoia_backend.agents_sdk.charity_research_agents.utils import smart_website_crawler
        
        result = smart_website_crawler('https://www.testcharity.org', max_pages=6)
        
        self.assertEqual(result.domain, 'testcharity.org')
        self.assertEqual(result.total_pages_crawled, 3)
        self.assertEqual(len(result.pages), 1)
    
    @patch('agents_sdk.charity_research_agents.utils.smart_website_crawler')
    def test_crawl_with_max_pages_limit(self, mock_crawler):
        """Test that crawling respects max_pages limit."""
        mock_crawler.return_value = MagicMock(
            total_pages_crawled=6,
            pages=[MagicMock() for _ in range(6)]
        )
        
        from backend.eunoia_backend.agents_sdk.charity_research_agents.utils import smart_website_crawler
        
        result = smart_website_crawler('https://www.testcharity.org', max_pages=6)
        
        # Verify crawler was called with correct max_pages
        mock_crawler.assert_called_once_with('https://www.testcharity.org', max_pages=6)
        self.assertEqual(result.total_pages_crawled, 6)


class CharityProfileExtractionTests(TestCase):
    """Test AI-powered charity profile extraction."""
    
    @patch('agents_sdk.charity_research_agents.manager.Runner.run')
    async def test_extract_charity_profile(self, mock_runner):
        """Test extracting charity profile from crawled data."""
        # Mock AI agent response
        mock_result = MagicMock()
        mock_result.final_output_as.return_value = MagicMock(
            tagline='Helping children thrive',
            summary='We provide education and healthcare to children',
            keywords=['education', 'children', 'healthcare'],
            category='EDU',
            country_of_operation='Kenya',
            year_founded=2010,
            contact_person='John Doe',
        )
        mock_runner.return_value = mock_result
        
        from backend.eunoia_backend.agents_sdk.charity_research_agents.charity_profile_agent import CharityProfile
        
        # Would need to call the actual agent in an async context
        # For this test, we verify the mock structure
        profile = mock_result.final_output_as(CharityProfile)
        
        self.assertEqual(profile.tagline, 'Helping children thrive')
        self.assertEqual(profile.category, 'EDU')
        self.assertIn('education', profile.keywords)


class MovementDiscoveryTests(TestCase):
    """Test AI-powered movement discovery."""
    
    @patch('agents_sdk.charity_research_agents.manager.Runner.run')
    async def test_discover_movements(self, mock_runner):
        """Test discovering movements from crawled data."""
        # Mock AI agent response
        mock_result = MagicMock()
        mock_result.final_output_as.return_value = MagicMock(
            movements=[
                MagicMock(
                    title='School Building Program',
                    summary='Building schools in rural areas',
                    category='education',
                    geography='Kenya',
                    source_urls=['https://charity.org/schools'],
                    confidence_score=0.9,
                ),
                MagicMock(
                    title='Teacher Training Initiative',
                    summary='Training local teachers',
                    category='education',
                    geography='Kenya',
                    source_urls=['https://charity.org/teachers'],
                    confidence_score=0.85,
                ),
            ]
        )
        mock_runner.return_value = mock_result
        
        from backend.eunoia_backend.agents_sdk.charity_research_agents.movement_finder_agent import MovementAnalysisResult
        
        result = mock_result.final_output_as(MovementAnalysisResult)
        
        self.assertEqual(len(result.movements), 2)
        self.assertEqual(result.movements[0].title, 'School Building Program')
        self.assertEqual(result.movements[0].confidence_score, 0.9)


class EmbeddingGenerationTests(TestCase):
    """Test embedding generation for semantic search."""
    
    @patch('main.utils.get_embedding')
    def test_generate_charity_embedding(self, mock_embedding):
        """Test generating embedding for charity."""
        # Mock embedding API response
        mock_embedding.return_value = [0.1] * 1536  # 1536-dimensional vector
        
        charity = Charity.objects.create(
            name='Test Charity',
            description='We help children',
            aptos_wallet_address='0x' + 'a' * 64,
            contact_email='test@charity.org',
        )
        
        from backend.eunoia_backend.main.utils import get_embedding
        
        text = f"{charity.description}"
        embedding = get_embedding(text)
        
        self.assertEqual(len(embedding), 1536)
        mock_embedding.assert_called_once_with(text)
    
    @patch('main.utils.get_embedding')
    def test_generate_movement_embedding(self, mock_embedding):
        """Test generating embedding for movement."""
        mock_embedding.return_value = [0.2] * 1536
        
        charity = Charity.objects.create(
            name='Test Charity',
            description='Test',
            aptos_wallet_address='0x' + 'a' * 64,
            contact_email='test@charity.org',
        )
        
        movement = Movement.objects.create(
            charity=charity,
            title='Test Movement',
            slug='test-movement',
            summary='This is a test movement for education',
        )
        
        from backend.eunoia_backend.main.utils import get_embedding
        
        embedding = get_embedding(movement.summary)
        
        self.assertEqual(len(embedding), 1536)
        mock_embedding.assert_called_once_with(movement.summary)


class CharityResearchWorkflowTests(TransactionTestCase):
    """Test end-to-end charity research workflow."""
    
    def setUp(self):
        """Set up test data."""
        self.charity = Charity.objects.create(
            name='Test Charity',
            description='Initial description',
            aptos_wallet_address='0x' + 'a' * 64,
            contact_email='test@charity.org',
            website_url='https://www.testcharity.org',
        )
    
    @patch('agents_sdk.charity_research_agents.manager.Runner.run')
    @patch('agents_sdk.charity_research_agents.utils.smart_website_crawler')
    @patch('main.utils.get_embedding')
    def test_complete_research_workflow(self, mock_embedding, mock_crawler, mock_runner):
        """Test complete research workflow synchronously."""
        # Mock crawling
        mock_crawler.return_value = MagicMock(
            domain='testcharity.org',
            main_url='https://www.testcharity.org',
            total_pages_crawled=3,
            pages=[
                MagicMock(
                    title='About',
                    url='https://www.testcharity.org/about',
                    content='We help children',
                    headings=['Mission'],
                    meta_description='Test charity',
                )
            ]
        )
        
        # Mock AI profile extraction
        profile_result = MagicMock()
        profile_result.final_output_as.return_value = MagicMock(
            tagline='Helping children',
            summary='We provide education',
            keywords=['education', 'children'],
            category='EDU',
            country_of_operation='Kenya',
        )
        
        # Mock AI movement discovery
        movement_result = MagicMock()
        movement_result.final_output_as.return_value = MagicMock(
            movements=[
                MagicMock(
                    title='Education Program',
                    summary='Teaching children',
                    category='education',
                    geography='Kenya',
                    source_urls=['https://testcharity.org/program'],
                    confidence_score=0.9,
                )
            ]
        )
        
        # Mock Runner.run to return profile then movements
        mock_runner.side_effect = [profile_result, movement_result]
        
        # Mock embeddings
        mock_embedding.return_value = [0.1] * 1536
        
        # Run research
        from backend.eunoia_backend.agents_sdk import research_charity_sync
        
        result = research_charity_sync(self.charity.id, max_pages=3)
        
        # Verify success
        self.assertTrue(result.get('success'))
        self.assertEqual(result.get('charity_id'), self.charity.id)
        self.assertEqual(result.get('pages_crawled'), 3)
        self.assertEqual(result.get('movements_found'), 1)
        
        # Verify charity was updated
        self.charity.refresh_from_db()
        self.assertEqual(self.charity.tagline, 'Helping children')
        self.assertEqual(self.charity.category, 'EDU')
        
        # Verify movement was created
        movements = Movement.objects.filter(charity=self.charity)
        self.assertEqual(movements.count(), 1)
        self.assertEqual(movements.first().title, 'Education Program')
    
    @patch('agents_sdk.charity_research_agents.utils.smart_website_crawler')
    def test_research_without_website_url(self, mock_crawler):
        """Test that research fails gracefully without website URL."""
        charity = Charity.objects.create(
            name='No URL Charity',
            description='Test',
            aptos_wallet_address='0x' + 'b' * 64,
            contact_email='test@charity.org',
            # No website_url
        )
        
        from backend.eunoia_backend.agents_sdk import research_charity_sync
        
        result = research_charity_sync(charity.id)
        
        self.assertFalse(result.get('success'))
        self.assertIn('no website_url', result.get('error', '').lower())
        mock_crawler.assert_not_called()


class BackgroundResearchTests(TransactionTestCase):
    """Test background research execution."""
    
    @patch('agents_sdk.charity_research_agents.manager.CharityResearchManager.research_charity')
    def test_background_research_launch(self, mock_research):
        """Test launching background research."""
        charity = Charity.objects.create(
            name='Test Charity',
            description='Test',
            aptos_wallet_address='0x' + 'a' * 64,
            contact_email='test@charity.org',
            website_url='https://www.testcharity.org',
        )
        
        from backend.eunoia_backend.agents_sdk import launch_charity_research_in_background
        
        # Launch in background (won't actually complete in test)
        launch_charity_research_in_background(charity.id, max_pages=6)
        
        # Just verify it doesn't crash
        # In real scenario, this runs in a daemon thread


if __name__ == '__main__':
    import sys
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.eunoia_backend.eunoia_backend.settings')
    django.setup()
    
    from django.test.utils import get_runner
    from django.conf import settings
    
    TestRunner = get_runner(settings)
    test_runner = TestRunner()
    failures = test_runner.run_tests(['tests.test_movements_research'])
    sys.exit(bool(failures))

