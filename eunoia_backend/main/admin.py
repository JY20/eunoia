import subprocess
import json
from django.contrib import admin
from django.contrib import messages
from .models import Charity, Impact, MarketingCampaign, SocialPost

@admin.register(Charity)
class CharityAdmin(admin.ModelAdmin):
    list_display = (
        'name', 
        'category',
        'contact_email',
        'aptos_wallet_address', 
        'polkadot_wallet_address',
        'is_verified', 
        'date_registered',
        'country_of_operation'
    )
    list_filter = ('is_verified', 'category', 'date_registered', 'country_of_operation')
    search_fields = ('name', 'contact_email', 'aptos_wallet_address', 'polkadot_wallet_address', 'tagline', 'description')
    actions = ['verify_charities', 'register_charity_on_chain']
    readonly_fields = ('date_registered',)
    fieldsets = (
        (None, {
            'fields': ('name', 'tagline', 'logo', 'description')
        }),
        ('Categorization & Verification', {
            'fields': ('category', 'is_verified', 'registration_document')
        }),
        ('Contact & Location', {
            'fields': ('contact_person', 'contact_email', 'website_url', 'country_of_operation', 'year_founded')
        }),
        ('Wallet Addresses', {
            'fields': ('aptos_wallet_address', 'polkadot_wallet_address')
        }),
        # Add a section for 'additional_fees' once clarified and implemented
        ('Dates', {
            'fields': ('date_registered',)
        }),
    )

    def verify_charities(self, request, queryset):
        queryset.update(is_verified=True)
    verify_charities.short_description = "Mark selected charities as verified"

    def register_charity_on_chain(self, request, queryset):
        # Constants for your deployed module
        MODULE_ADDRESS = "0x3940277b22c1fe2c8631bdce9dbcf020c3b8240a5417fa13ac21d37860f88011"
        MODULE_NAME = "eunoia_foundation"
        FUNCTION_NAME = "add_charity"
        
        success_count = 0
        error_count = 0
        
        # Remind about initialization if it's a common first step
        if not hasattr(self, '_initialization_reminder_sent'):
            self.message_user(request, "Reminder: Ensure the smart contract module has been initialized by the owner before adding charities.", messages.INFO)
            self._initialization_reminder_sent = True

        for charity in queryset:
            charity_name_str = charity.name
            charity_wallet_addr_str = charity.aptos_wallet_address

            if not charity_name_str or not charity_wallet_addr_str:
                self.message_user(request, f"Skipping '{charity.name if charity.name else 'Unnamed Charity'}': Missing name or Aptos wallet address.", messages.WARNING)
                continue

            # Ensure aptos_wallet_address starts with 0x for the CLI
            if not charity_wallet_addr_str.startswith("0x"):
                 charity_wallet_addr_str = "0x" + charity_wallet_addr_str

            command = [
                "aptos", "move", "run",
                "--function-id", f"{MODULE_ADDRESS}::{MODULE_NAME}::{FUNCTION_NAME}",
                "--args", f"string:{charity_name_str}", f"address:{charity_wallet_addr_str}",
                "--profile", "default", # Assumes 'default' profile is the module owner
                "--assume-yes" # Bypasses interactive confirmation
            ]

            try:
                result = subprocess.run(command, capture_output=True, text=True, check=False)
                processed_successfully = False

                if result.returncode == 0:
                    try:
                        output_json = json.loads(result.stdout)
                        if isinstance(output_json, dict) and \
                           (output_json.get("Result") == "Success" or \
                            output_json.get("success") is True or \
                            (output_json.get("transaction", {}).get("success") is True and \
                             "Executed successfully" in output_json.get("transaction", {}).get("vm_status", ""))):
                            processed_successfully = True
                    except json.JSONDecodeError:
                        if "Transaction" in result.stdout and "submitted" in result.stdout and not result.stderr:
                            processed_successfully = True
                
                if processed_successfully:
                    success_count += 1
                    self.message_user(request, f"Successfully submitted registration for '{charity_name_str}' to the blockchain.", messages.SUCCESS)
                else:
                    error_count += 1
                    error_message = result.stderr.strip() or result.stdout.strip()
                    if "E_CHARITY_ALREADY_EXISTS" in error_message:
                        self.message_user(request, f"Charity '{charity_name_str}' is already registered on the blockchain.", messages.WARNING)
                    elif "E_MODULE_NOT_INITIALIZED" in error_message or "Failed to get account resource for ContractData" in error_message : # Check for resource not found error too
                         self.message_user(request, f"Failed to register '{charity_name_str}': The smart contract module may not be initialized or `ContractData` resource not found. Please initialize it first.", messages.ERROR)
                    elif "Error: RPC error" in error_message: # Network or endpoint issue
                        self.message_user(request, f"Failed to register '{charity_name_str}': Network RPC error. Check Aptos node connection. Details: {error_message}", messages.ERROR)
                    else:
                        self.message_user(request, f"Failed to register '{charity_name_str}' on-chain. CLI Output: {error_message}", messages.ERROR)
                        
            except FileNotFoundError:
                self.message_user(request, "Critical Error: 'aptos' CLI not found. Ensure it's installed and in the system's PATH.", messages.ERROR)
                return 
            except Exception as e:
                error_count += 1
                self.message_user(request, f"An unexpected error occurred while trying to register '{charity_name_str}': {str(e)}", messages.ERROR)

        # Summary messages
        if queryset.count() == 0:
            self.message_user(request, "No charities were selected.", messages.INFO)
        elif success_count > 0 and error_count == 0:
            self.message_user(request, f"All {success_count} selected charities were successfully processed for on-chain registration.", messages.SUCCESS)
        elif success_count > 0 and error_count > 0:
            self.message_user(request, f"Processed {success_count} charities successfully for on-chain registration. {error_count} charities had errors.", messages.WARNING)
        elif error_count > 0 and success_count == 0 and queryset.count() > 0:
             self.message_user(request, f"Could not register any of the {queryset.count()} selected charities on-chain due to errors.", messages.ERROR)
        # No explicit message if success_count == 0 and error_count == 0 and queryset.count() > 0, as individual skip messages would have appeared.
    
    register_charity_on_chain.short_description = "Register selected charities on Aptos blockchain (via CLI)"

@admin.register(Impact)
class ImpactAdmin(admin.ModelAdmin):
    list_display = ('charity_name', 'last_updated')
    search_fields = ('charity__name', 'description')
    readonly_fields = ('last_updated',)
    autocomplete_fields = ['charity']

    def charity_name(self, obj):
        return obj.charity.name
    charity_name.short_description = 'Charity'
    charity_name.admin_order_field = 'charity__name'

class SocialPostInline(admin.TabularInline):
    model = SocialPost
    extra = 1
    fields = ('title', 'platform', 'post_date', 'post_url', 'reach', 'engagement_rate')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(MarketingCampaign)
class MarketingCampaignAdmin(admin.ModelAdmin):
    list_display = ('name', 'charity_name', 'start_date', 'end_date', 'is_active', 'budget')
    list_filter = ('is_active', 'start_date', 'charity__name')
    search_fields = ('name', 'description', 'charity__name')
    readonly_fields = ('created_at', 'updated_at')
    autocomplete_fields = ['charity']
    inlines = [SocialPostInline]
    fieldsets = (
        (None, {
            'fields': ('charity', 'name', 'description')
        }),
        ('Timeline & Status', {
            'fields': ('start_date', 'end_date', 'is_active')
        }),
        ('Financials', {
            'fields': ('budget',)
        }),
        ('Tracking', {
            'fields': ('created_at', 'updated_at')
        }),
    )

    def charity_name(self, obj):
        return obj.charity.name
    charity_name.short_description = 'Charity'

@admin.register(SocialPost)
class SocialPostAdmin(admin.ModelAdmin):
    list_display = ('title', 'campaign_name', 'platform', 'post_date', 'reach', 'engagement_rate')
    list_filter = ('platform', 'post_date', 'campaign__charity__name', 'campaign__name')
    search_fields = ('title', 'content', 'campaign__name', 'campaign__charity__name')
    readonly_fields = ('created_at', 'updated_at')
    autocomplete_fields = ['campaign']
    list_editable = ('reach', 'engagement_rate')
    fieldsets = (
        (None, {
            'fields': ('campaign', 'title', 'platform', 'post_date')
        }),
        ('Content', {
            'fields': ('content', 'image', 'post_url')
        }),
        ('Performance (Optional)', {
            'fields': ('reach', 'engagement_rate')
        }),
        ('Internal', {
            'fields': ('notes', 'created_at', 'updated_at')
        }),
    )

    def campaign_name(self, obj):
        return obj.campaign.name
    campaign_name.short_description = 'Campaign'
