from rest_framework import viewsets
from .models import Charity, Impact, MarketingCampaign, SocialPost
from .serializers import CharitySerializer, ImpactSerializer, MarketingCampaignSerializer, SocialPostSerializer

class CharityViewSet(viewsets.ModelViewSet):
    queryset = Charity.objects.all().order_by('-date_registered')
    serializer_class = CharitySerializer
    # Add permission_classes if needed, e.g., [permissions.IsAuthenticatedOrReadOnly]

class ImpactViewSet(viewsets.ModelViewSet):
    queryset = Impact.objects.all()
    serializer_class = ImpactSerializer

class MarketingCampaignViewSet(viewsets.ModelViewSet):
    queryset = MarketingCampaign.objects.all().order_by('-start_date')
    serializer_class = MarketingCampaignSerializer

class SocialPostViewSet(viewsets.ModelViewSet):
    queryset = SocialPost.objects.all().order_by('-post_date')
    serializer_class = SocialPostSerializer 