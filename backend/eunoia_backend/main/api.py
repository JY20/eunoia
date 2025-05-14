from rest_framework import serializers, viewsets, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Charity

class CharitySerializer(serializers.ModelSerializer):
    logo_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Charity
        fields = ['id', 'name', 'description', 'aptos_wallet_address', 'website_url', 'contact_email', 'logo_url', 'date_registered']
    
    def get_logo_url(self, obj):
        if obj.logo:
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