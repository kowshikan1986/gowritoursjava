from django.db import models, transaction
from django.utils import timezone
from django.core.exceptions import ValidationError
from core.models import AbstractBaseModel
from .validators import validate_image_size

class SiteLogo(AbstractBaseModel):
    """
    Model to manage the website's logo.
    Only one logo should be active at a time.
    """
    title = models.CharField(max_length=100, help_text="Internal name for the logo")
    image = models.ImageField(
        upload_to='logos/',
        validators=[validate_image_size],
        help_text="Upload a logo image (Max 5MB)"
    )
    is_active = models.BooleanField(
        default=False,
        help_text="If checked, this will be the currently displayed logo."
    )

    def save(self, *args, **kwargs):
        """
        Ensure only one logo is active at a time.
        If this one is set to active, deactivate all others.
        """
        if self.is_active:
            with transaction.atomic():
                SiteLogo.objects.filter(is_active=True).exclude(pk=self.pk).update(is_active=False)
        super().save(*args, **kwargs)

    def __str__(self):
        status = "Active" if self.is_active else "Inactive"
        return f"{self.title} ({status})"

    class Meta:
        verbose_name = "Site Logo"
        verbose_name_plural = "Site Logos"


class AdvertisementManager(models.Manager):
    def get_active_ads(self):
        """
        Returns ads that are marked active and fall within the scheduling window.
        Ordered by priority (lower number = higher priority).
        """
        now = timezone.now()
        return self.filter(
            is_active=True,
            start_date__lte=now,
            end_date__gte=now
        ).order_by('priority', '-created_at')

class Advertisement(AbstractBaseModel):
    """
    Model for managing advertisement banners.
    """
    title = models.CharField(max_length=200)
    image = models.ImageField(
        upload_to='ads/',
        validators=[validate_image_size],
        help_text="Banner image (Max 5MB)"
    )
    link_url = models.URLField(
        help_text="Destination URL when banner is clicked",
        blank=True,
        null=True
    )
    priority = models.PositiveIntegerField(
        default=10,
        help_text="Display priority (lower numbers appear first)"
    )
    start_date = models.DateTimeField(default=timezone.now)
    end_date = models.DateTimeField()
    is_active = models.BooleanField(default=True)

    objects = AdvertisementManager()

    def clean(self):
        """
        Validate that end_date is after start_date.
        """
        if self.start_date and self.end_date and self.end_date <= self.start_date:
            raise ValidationError("End date must be after start date.")

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['priority', '-created_at']
        verbose_name = "Advertisement"
        verbose_name_plural = "Advertisements"


class HeroBanner(AbstractBaseModel):
    """
    Configurable hero banner for the website homepage.
    Managed via Django Admin with uploadable background image and copy.
    """
    title = models.CharField(max_length=200)
    subtitle = models.TextField(blank=True)
    cta_text = models.CharField(max_length=100, blank=True)
    cta_link = models.CharField(max_length=200, blank=True)
    background_image = models.ImageField(
        upload_to='hero/',
        validators=[validate_image_size]
    )
    is_active = models.BooleanField(default=True)
    priority = models.PositiveIntegerField(default=10)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['priority', '-created_at']
        verbose_name = 'Hero Banner'
        verbose_name_plural = 'Hero Banners'
