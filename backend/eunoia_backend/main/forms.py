from django import forms
from .models import Charity
from agents_sdk import launch_charity_research_in_background

class CharityRegistrationForm(forms.ModelForm):
    class Meta:
        model = Charity
        fields = [
            'name',
            'description',
            'registration_document',
            'aptos_wallet_address',
            'website_url',
            'contact_email',
            'logo',
        ]
        widgets = {
            'name': forms.TextInput(attrs={'class': 'mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'}),
            'description': forms.Textarea(attrs={'rows': 4, 'class': 'mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'}),
            'registration_document': forms.ClearableFileInput(attrs={'class': 'mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none'}),
            'aptos_wallet_address': forms.TextInput(attrs={'class': 'mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm', 'placeholder': 'Enter your Aptos wallet address'}),
            'website_url': forms.URLInput(attrs={'class': 'mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm', 'placeholder': 'https://example.com'}),
            'contact_email': forms.EmailInput(attrs={'class': 'mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm', 'placeholder': 'contact@example.com'}),
            'logo': forms.ClearableFileInput(attrs={'class': 'mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none'}),
        }
        labels = {
            'name': 'Charity Name',
            'description': 'Tell us about your charity',
            'registration_document': 'Official Registration Document (PDF, JPG, PNG)',
            'aptos_wallet_address': 'Aptos Wallet Address for Donations',
            'website_url': 'Charity Website URL (Optional)',
            'contact_email': 'Public Contact Email',
            'logo': 'Charity Logo (Optional)',
        } 

    def save(self, commit=True):
        charity = super().save(commit=commit)
        if charity and charity.website_url:
            try:
                launch_charity_research_in_background(charity.id, max_pages=6)
            except Exception:
                pass
        return charity