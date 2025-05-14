from django.contrib import admin
from .models import Charity

@admin.register(Charity)
class CharityAdmin(admin.ModelAdmin):
    list_display = ('name', 'contact_email', 'aptos_wallet_address', 'is_verified', 'date_registered')
    list_filter = ('is_verified', 'date_registered')
    search_fields = ('name', 'contact_email', 'aptos_wallet_address')
    actions = ['verify_charities']

    def verify_charities(self, request, queryset):
        queryset.update(is_verified=True)
    verify_charities.short_description = "Mark selected charities as verified"
