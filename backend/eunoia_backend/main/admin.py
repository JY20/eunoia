from django.contrib import admin
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
    actions = ['verify_charities']
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
