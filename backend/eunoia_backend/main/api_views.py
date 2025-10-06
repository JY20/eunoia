from rest_framework import viewsets, views, status
from rest_framework.response import Response
from .models import Charity, Impact, MarketingCampaign, SocialPost, DonationTransaction, Movement
from .serializers import (
    CharitySerializer, 
    ImpactSerializer, 
    MarketingCampaignSerializer, 
    SocialPostSerializer,
    DonationTransactionPayloadRequestSerializer,
    DonationTransactionSerializer,
    MovementSerializer,
)
from aptos_sdk.account_address import AccountAddress
from aptos_sdk.transactions import (EntryFunction, TransactionPayload)
# Ensure you have a way to get the REST client, e.g., from settings or a utility function
# from aptos_sdk.client import RestClient # This line can be removed if not used elsewhere
# For this example, we are only creating the payload, not sending it, so RestClient might not be directly needed here.

# Constants for your deployed module
MODULE_ADDRESS = "0x3940277b22c1fe2c8631bdce9dbcf020c3b8240a5417fa13ac21d37860f88011"
MODULE_NAME = "eunoia_foundation"
DONATE_FUNCTION_NAME = "donate"

# Import agent service launcher
from agents_sdk import launch_charity_research_in_background
from agents_sdk.compass_matching_agents import match_top_movements_sync

class CharityViewSet(viewsets.ModelViewSet):
    queryset = Charity.objects.all().order_by('-date_registered')
    serializer_class = CharitySerializer
    # Add permission_classes if needed, e.g., [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        charity = serializer.save()
        # Kick off background research if website_url provided
        if charity.website_url:
            try:
                launch_charity_research_in_background(charity.id, max_pages=6)
            except Exception:
                pass

    def perform_update(self, serializer):
        charity = serializer.save()
        if charity.website_url:
            try:
                launch_charity_research_in_background(charity.id, max_pages=6)
            except Exception:
                pass

class ImpactViewSet(viewsets.ModelViewSet):
    queryset = Impact.objects.all()
    serializer_class = ImpactSerializer

class MarketingCampaignViewSet(viewsets.ModelViewSet):
    queryset = MarketingCampaign.objects.all().order_by('-start_date')
    serializer_class = MarketingCampaignSerializer

class SocialPostViewSet(viewsets.ModelViewSet):
    queryset = SocialPost.objects.all().order_by('-post_date')
    serializer_class = SocialPostSerializer

class PrepareDonationTransactionView(views.APIView):
    def post(self, request, *args, **kwargs):
        serializer = DonationTransactionPayloadRequestSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            charity_name = data['charity_name']
            amount = data['amount']
            coin_identifier_string = data['coin_identifier_string']
            # donor_address = data['donor_address'] # Not directly used in payload creation this way, but good for validation

            try:
                # Construct the entry function payload
                # <CoinType> in Move is a type argument, passed as type_args in the SDK
                # The actual CoinType (e.g., 0x1::aptos_coin::AptosCoin) is the type_arg.
                transaction_arguments = [
                    charity_name,               # charity_name: String
                    coin_identifier_string,     # coin_identifier_string: String (for your contract)
                    str(amount),                # amount: u64, ensure it's a string in the payload
                ]

                payload = EntryFunction.natural(
                    f"{MODULE_ADDRESS}::{MODULE_NAME}",
                    DONATE_FUNCTION_NAME,
                    [coin_identifier_string],  # Type arguments: The actual CoinType
                    transaction_arguments      # Function arguments
                )
                
                # The frontend will need this payload structure. 
                # The exact format might depend on the wallet adapter used on the frontend.
                # Typically, it's an object with type, function, type_arguments, and arguments.
                response_payload = {
                    "type": "entry_function_payload",
                    "function": f"{MODULE_ADDRESS}::{MODULE_NAME}::{DONATE_FUNCTION_NAME}",
                    "type_arguments": [coin_identifier_string],
                    "arguments": transaction_arguments
                }
                
                return Response(response_payload, status=status.HTTP_200_OK)

            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST) 

from .utils import enhance_query_and_search, generate_combined_mission_statement # Import new function
# import asyncio # No longer needed for this view

class CharitySemanticSearchView(views.APIView):
    permission_classes = [] # Or your preferred permissions

    def get(self, request, *args, **kwargs): # Changed to synchronous def
        query = request.query_params.get('query', None)
        if not query:
            return Response({"error": "Query parameter is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            matched_charities_qs = enhance_query_and_search(query) 
            
            resonating_statement = "Explore these charities that align with your vision."
            # contributing_charity_names = [] # This variable was defined but not used

            if matched_charities_qs:
                charities_data_for_prompt = [
                    {
                        "name": charity.name,
                        "description": charity.description or "",
                    }
                    for charity in matched_charities_qs[:3]
                ]
                
                if charities_data_for_prompt:
                    combined_mission_result = generate_combined_mission_statement(query, charities_data_for_prompt)
                    if combined_mission_result and combined_mission_result.resonating_statement:
                        resonating_statement = combined_mission_result.resonating_statement
            
            charity_serializer = CharitySerializer(matched_charities_qs, many=True, context={'request': request})
            
            response_data = {
                "matched_charities": charity_serializer.data,
                "combined_mission": resonating_statement,
            }
            return Response(response_data, status=status.HTTP_200_OK)
        
        except Exception as e:
            print(f"Error in CharitySemanticSearchView: {e}") 
            return Response({"error": f"An error occurred during search: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# New ViewSet for DonationTransaction
class DonationTransactionViewSet(viewsets.ModelViewSet):
    queryset = DonationTransaction.objects.all().order_by('-timestamp')
    serializer_class = DonationTransactionSerializer
    permission_classes = [] # Allow any for now, adjust as needed for production


class MovementViewSet(viewsets.ModelViewSet):
    queryset = Movement.objects.all().order_by('-created_at')
    serializer_class = MovementSerializer
    permission_classes = []


class CompassMatchView(views.APIView):
    permission_classes = []

    def post(self, request, *args, **kwargs):
        query = request.data.get('query')
        top_k = int(request.data.get('top_k', 10))
        if not query:
            return Response({"error": "Missing 'query'"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            result = match_top_movements_sync(query, top_k)
            return Response(result, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Ensure your serializers.py has DonationTransactionSerializer
# Example (add this to your main/serializers.py):
# from .models import DonationTransaction
# class DonationTransactionSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = DonationTransaction
#         fields = '__all__' 