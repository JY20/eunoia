from django.urls import path
from .views import HomeView, RegisterCharityView, CharityListView
from . import api

app_name = 'main'

urlpatterns = [
    path('', HomeView.as_view(), name='home'),
    path('register-charity/', RegisterCharityView.as_view(), name='register-charity'),
    path('charities/', CharityListView.as_view(), name='charity-list'),
    
    # API endpoints
    path('api/charities/featured/', api.featured_charities, name='api-featured-charities'),
    path('api/charities/', api.all_charities, name='api-all-charities'),
    path('api/charities/<int:pk>/', api.charity_detail, name='api-charity-detail'),
] 