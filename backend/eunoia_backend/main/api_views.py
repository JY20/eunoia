from rest_framework import viewsets, views, status
from rest_framework.response import Response
from .models import Charity, Impact, MarketingCampaign, SocialPost
from .serializers import (
    CharitySerializer, 
    ImpactSerializer, 
    MarketingCampaignSerializer, 
    SocialPostSerializer,
    DonationTransactionPayloadRequestSerializer
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

from .utils import enhance_query_and_search # Import the (now synchronous) function
# import asyncio # No longer needed for this view

class CharitySemanticSearchView(views.APIView):
    permission_classes = [] # Or your preferred permissions

    def get(self, request, *args, **kwargs): # Changed to synchronous def
        query = request.query_params.get('query', None)
        if not query:
            return Response({"error": "Query parameter is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            results = enhance_query_and_search(query) # Direct synchronous call
            
            if not results:
                return Response({"message": "No matching charities found.", "results": []}, status=status.HTTP_200_OK)
            
            serializer = CharitySerializer(results, many=True, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        except Exception as e:
            print(f"Error in CharitySemanticSearchView: {e}") # Added print for server log
            return Response({"error": f"An error occurred during search: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR) 