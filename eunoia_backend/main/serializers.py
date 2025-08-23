from rest_framework import serializers
from .models import Charity, Impact, MarketingCampaign, SocialPost, DonationTransaction

class CharitySerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    logo_url = serializers.SerializerMethodField()

    class Meta:
        model = Charity
        fields = [
            'id', 'name', 'description', 'registration_document', 
            'aptos_wallet_address', 'polkadot_wallet_address', 
            'website_url', 'contact_email', 'logo', 'logo_url',
            'is_verified', 'date_registered', 'extracted_text_data', 
            'embedding', 'keywords', 'category', 'category_display',
            'country_of_operation', 'year_founded', 'contact_person', 'tagline'
        ]
        read_only_fields = ['embedding', 'extracted_text_data', 'is_verified', 'date_registered', 'keywords']

    def get_logo_url(self, obj):
        request = self.context.get('request')
        if obj.logo and hasattr(obj.logo, 'url'):
            if request is not None:
                return request.build_absolute_uri(obj.logo.url)
            return obj.logo.url
        return None

class ImpactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Impact
        fields = '__all__'

class MarketingCampaignSerializer(serializers.ModelSerializer):
    class Meta:
        model = MarketingCampaign
        fields = '__all__'

class SocialPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = SocialPost
        fields = '__all__'

class DonationTransactionPayloadRequestSerializer(serializers.Serializer):
    charity_name = serializers.CharField()
    amount = serializers.IntegerField() # Will be treated as u64 on backend/contract
    coin_identifier_string = serializers.CharField(default='0x1::aptos_coin::AptosCoin')
    donor_address = serializers.CharField()

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be positive.")
        return value

# New Serializer for DonationTransaction
class DonationTransactionSerializer(serializers.ModelSerializer):
    blockchain_display = serializers.CharField(source='get_blockchain_display', read_only=True)

    class Meta:
        model = DonationTransaction
        fields = [
            'id', 'transaction_hash', 'donor_address', 'charity_name', 
            'charity_wallet_address', 'amount', 'currency', 'blockchain', 
            'blockchain_display', 'timestamp', 'status'
        ] 