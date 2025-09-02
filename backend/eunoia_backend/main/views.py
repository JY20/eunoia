from django.shortcuts import render, redirect
from django.urls import reverse_lazy
from django.views.generic import ListView, CreateView, TemplateView
from .models import Charity
from .forms import CharityRegistrationForm
from django.contrib import messages

# Create your views here.

class HomeView(TemplateView):
    template_name = 'home.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['charities'] = Charity.objects.filter(is_verified=True)[:6] # Display up to 6 verified charities
        context['page_title'] = 'Welcome to Eunoia'
        return context

class RegisterCharityView(CreateView):
    model = Charity
    form_class = CharityRegistrationForm
    template_name = 'main/register_charity.html'
    success_url = reverse_lazy('main:home') # Redirect to home after successful registration

    def form_valid(self, form):
        messages.success(self.request, 'Thank you for registering your charity! It will be reviewed by our team shortly.')
        return super().form_valid(form)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['page_title'] = 'Register Your Charity'
        return context

class CharityListView(ListView):
    model = Charity
    template_name = 'main/charity_list.html' # You might want a dedicated page for all charities
    context_object_name = 'charities'
    paginate_by = 10

    def get_queryset(self):
        return Charity.objects.filter(is_verified=True).order_by('-date_registered')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['page_title'] = 'Verified Charities'
        return context
