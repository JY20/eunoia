from rest_framework import serializers, viewsets, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Charity

class CharitySerializer(serializers.ModelSerializer):
    logo_url = serializers.SerializerMethodField()
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    
    class Meta:
        model = Charity
        fields = [
            'id', 'name', 'description', 'tagline', 'category', 'category_display', 'keywords',
            'aptos_wallet_address', 'website_url', 'contact_email', 'logo_url', 
            'date_registered', 'is_verified',
            # Add any other relevant model fields you want to expose
            'extracted_text_data', # If you want to expose this too
            'polkadot_wallet_address',
            'country_of_operation',
            'year_founded',
            'contact_person'
        ]
    
    def get_logo_url(self, obj):
        if obj.logo and hasattr(obj.logo, 'url'):
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.logo.url)
            return obj.logo.url
        return None

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def featured_charities(request):
    """
    Retrieve a list of featured (verified) charities.
    """
    charities = Charity.objects.filter(is_verified=True).order_by('-date_registered')[:6]
    serializer = CharitySerializer(charities, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def all_charities(request):
    """
    Retrieve all verified charities.
    """
    charities = Charity.objects.filter(is_verified=True).order_by('-date_registered')
    serializer = CharitySerializer(charities, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def charity_detail(request, pk):
    """
    Retrieve details for a specific charity.
    """
    try:
        charity = Charity.objects.get(pk=pk, is_verified=True)
    except Charity.DoesNotExist:
        return Response({"error": "Charity not found or not verified"}, status=404)
    
    serializer = CharitySerializer(charity)
    return Response(serializer.data) 