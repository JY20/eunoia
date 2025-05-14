from rest_framework import serializers
from .models import Charity, Impact, MarketingCampaign, SocialPost

class CharitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Charity
        fields = '__all__'

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