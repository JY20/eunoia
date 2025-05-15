from django.db import models
from django.utils.translation import gettext_lazy as _

# Create your models here.

class Charity(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    # For registration_proof, consider how you want to handle file uploads and validation.
    # For simplicity, starting with CharField, but FileField is better for actual files.
    registration_document = models.FileField(upload_to='charity_documents/', blank=True, null=True)
    aptos_wallet_address = models.CharField(max_length=100) # Research Aptos address format for validation
    website_url = models.URLField(blank=True, null=True)
    contact_email = models.EmailField()
    logo = models.ImageField(upload_to='charity_logos/', blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    date_registered = models.DateTimeField(auto_now_add=True)

    extracted_text_data = models.TextField(blank=True, null=True, help_text="Raw text extracted from the charity's website")
    embedding = models.JSONField(blank=True, null=True, help_text="Embedding of the charity description")
    keywords = models.JSONField(blank=True, null=True, help_text="Keywords describing the charity's focus, extracted by AI")

    # New fields
    polkadot_wallet_address = models.CharField(_("Polkadot Wallet Address"), max_length=100, blank=True, null=True)
    
    class CharityCategory(models.TextChoices):
        ENVIRONMENT = 'ENV', _('Environment')
        EDUCATION = 'EDU', _('Education')
        HEALTH = 'HEA', _('Health & Medicine')
        ANIMALS = 'ANI', _('Animal Welfare')
        ARTS = 'ART', _('Arts & Culture')
        HUMAN_RIGHTS = 'HUM', _('Human Rights')
        COMMUNITY = 'COM', _('Community Development')
        DISASTER = 'DIS', _('Disaster Relief')
        OTHER = 'OTH', _('Other')

    category = models.CharField(
        _("Category"),
        max_length=3,
        choices=CharityCategory.choices,
        default=CharityCategory.OTHER,
        blank=True, null=True
    )
    country_of_operation = models.CharField(_("Country of Operation"), max_length=100, blank=True, null=True)
    year_founded = models.PositiveIntegerField(_("Year Founded"), blank=True, null=True)
    contact_person = models.CharField(_("Contact Person"), max_length=255, blank=True, null=True)
    tagline = models.CharField(_("Tagline/Short Summary"), max_length=255, blank=True, null=True)

    # Placeholder for "additional fees" based on clarification
    # operational_overhead_percentage = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True, help_text=_("Percentage of funds used for administrative/operational costs"))

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Charities"
        ordering = ['-date_registered']

class Impact(models.Model):
    charity = models.OneToOneField(Charity, on_delete=models.CASCADE, primary_key=True, related_name='impact_details')
    description = models.TextField(_("Impact Statement/Description"), help_text=_("Describe the charity's impact, key achievements, and goals."))
    metrics_reported = models.JSONField(_("Impact Metrics (JSON)"), blank=True, null=True, help_text=_("Flexible field for various metrics, e.g., {'lives_impacted': 1000, 'trees_planted': 5000}"))
    last_updated = models.DateTimeField(_("Last Updated"), auto_now=True)

    def __str__(self):
        return f"Impact Report for {self.charity.name}"

    class Meta:
        verbose_name = _("Impact Report")
        verbose_name_plural = _("Impact Reports")

# Marketing Models
class MarketingCampaign(models.Model):
    charity = models.ForeignKey(Charity, on_delete=models.CASCADE, related_name='marketing_campaigns')
    name = models.CharField(_("Campaign Name"), max_length=255)
    description = models.TextField(_("Campaign Description"), blank=True, null=True)
    start_date = models.DateField(_("Start Date"))
    end_date = models.DateField(_("End Date"), blank=True, null=True)
    budget = models.DecimalField(_("Budget (USD)"), max_digits=10, decimal_places=2, blank=True, null=True)
    is_active = models.BooleanField(_("Is Active"), default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.charity.name})"

    class Meta:
        verbose_name = _("Marketing Campaign")
        verbose_name_plural = _("Marketing Campaigns")
        ordering = ['charity', '-start_date']

class SocialPost(models.Model):
    class PlatformChoices(models.TextChoices):
        INSTAGRAM = 'IG', _('Instagram')
        FACEBOOK = 'FB', _('Facebook')
        TWITTER = 'TW', _('X (Twitter)')
        LINKEDIN = 'LI', _('LinkedIn')
        TIKTOK = 'TT', _('TikTok')
        BLOG = 'BG', _('Blog Post')
        OTHER = 'OT', _('Other')

    campaign = models.ForeignKey(MarketingCampaign, on_delete=models.CASCADE, related_name='social_posts')
    title = models.CharField(_("Post Title/Headline"), max_length=255)
    content = models.TextField(_("Post Content"))
    image = models.ImageField(_("Image/Visual"), upload_to='marketing_posts_images/', blank=True, null=True)
    platform = models.CharField(
        _("Platform"),
        max_length=2,
        choices=PlatformChoices.choices,
        default=PlatformChoices.OTHER
    )
    post_date = models.DateTimeField(_("Scheduled/Actual Post Date"))
    post_url = models.URLField(_("URL to Live Post"), blank=True, null=True)
    reach = models.PositiveIntegerField(_("Reach (Optional)"), blank=True, null=True)
    engagement_rate = models.DecimalField(_("Engagement Rate (%) (Optional)"), max_digits=5, decimal_places=2, blank=True, null=True)
    notes = models.TextField(_("Internal Notes"), blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} on {self.get_platform_display()} for {self.campaign.name}"

    class Meta:
        verbose_name = _("Social Media Post")
        verbose_name_plural = _("Social Media Posts")
        ordering = ['campaign', '-post_date']
