from django.db import models

# Create your models here.

class Charity(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    # For registration_proof, consider how you want to handle file uploads and validation.
    # For simplicity, starting with CharField, but FileField is better for actual files.
    registration_document = models.FileField(upload_to='charity_documents/', blank=True, null=True)
    aptos_wallet_address = models.CharField(max_length=100) # Research Aptos address format for validation
    website_url = models.URLField(blank=True, null=True)
    contact_email = models.EmailField()
    logo = models.ImageField(upload_to='charity_logos/', blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    date_registered = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Charities"
