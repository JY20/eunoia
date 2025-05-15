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
# from aptos_sdk.client import RestClient 
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

from .utils import enhance_query_and_search # Import the new function
import asyncio

class CharitySemanticSearchView(views.APIView):
    permission_classes = [] # Or your preferred permissions

    async def get(self, request, *args, **kwargs):
        query = request.query_params.get('query', None)
        if not query:
            return Response({"error": "Query parameter is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Since enhance_query_and_search is async, and DRF views are typically sync,
            # we need to run the async function in an event loop.
            # Django 4.1+ with ASGI servers handle this more gracefully.
            # For older versions or WSGI, using asgiref.sync.async_to_sync is common.
            # For simplicity here, assuming an environment where asyncio.run can be used or 
            # that the view itself is made async if supported by your DRF/Django version.
            
            # If your Django/DRF setup supports async views directly:
            # (e.g., if using Django 3.1+ and an ASGI server like Uvicorn/Daphne)
            # you can define the view method as `async def get(self, request, *args, **kwargs):`
            # and then `await enhance_query_and_search(query)`
            
            # For this example, let's assume the view method is async as shown above.
            results = await enhance_query_and_search(query)
            
            if not results:
                return Response({"message": "No matching charities found.", "results": []}, status=status.HTTP_200_OK)
            
            # Serialize the results
            # Make sure your CharitySerializer can handle the Charity model instances
            serializer = CharitySerializer(results, many=True, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        except Exception as e:
            # Log the exception e
            return Response({"error": f"An error occurred during search: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR) 