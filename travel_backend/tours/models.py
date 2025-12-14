from django.db import models
from django.utils.text import slugify
from django.core.validators import MinValueValidator
from core.models import AbstractBaseModel, SoftDeleteModel, SoftDeleteManager
from marketing.validators import validate_image_size

class TourServiceManager(SoftDeleteManager):
    def active(self):
        return self.get_queryset().filter(is_active=True)

    def featured(self):
        return self.active().filter(is_featured=True)

class TourCategory(AbstractBaseModel):
    """
    Category for grouping tours (e.g., UK Tours, European Tours).
    """
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=150, unique=True, blank=True)
    image = models.ImageField(
        upload_to='categories/', 
        validators=[validate_image_size],
        blank=True, 
        null=True
    )
    description = models.TextField(blank=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Tour Category"
        verbose_name_plural = "Tour Categories"


class TourSubCategory(AbstractBaseModel):
    """
    Sub-category nested under a TourCategory.
    """
    category = models.ForeignKey(
        TourCategory,
        on_delete=models.CASCADE,
        related_name='subcategories',
        verbose_name="Parent Category"
    )
    name = models.CharField(max_length=120)
    slug = models.SlugField(max_length=180, unique=True, blank=True)
    description = models.TextField(blank=True)
    image = models.ImageField(
        upload_to='subcategories/',
        validators=[validate_image_size],
        blank=True,
        null=True
    )

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.category.name} / {self.name}"

    class Meta:
        verbose_name = "Tour Sub-Category"
        verbose_name_plural = "Tour Sub-Categories"
        unique_together = ('category', 'name')

class TourService(AbstractBaseModel, SoftDeleteModel):
    """
    Model representing a tour package or service.
    Supports soft deletion to preserve history.
    """
    category = models.ForeignKey(
        TourCategory, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='tours',
        verbose_name="Category"
    )
    title = models.CharField(max_length=200, unique=True)
    slug = models.SlugField(max_length=250, unique=True, blank=True)
    description = models.TextField()
    price = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        validators=[MinValueValidator(0.01)]
    )
    duration = models.CharField(max_length=100, help_text="e.g., '3 Days', '5 Hours'")
    location = models.CharField(max_length=200)
    featured_image = models.ImageField(
        upload_to='tours/featured/',
        validators=[validate_image_size]
    )
    is_active = models.BooleanField(default=True, verbose_name="Available")
    is_featured = models.BooleanField(default=False, verbose_name="Featured Tour")
    
    # Metadata for SEO
    meta_keywords = models.CharField(max_length=255, blank=True, help_text="Comma separated keywords")
    meta_description = models.CharField(max_length=255, blank=True)

    objects = TourServiceManager() # Override default manager? 
    # Actually SoftDeleteModel sets objects = SoftDeleteManager().
    # I should inherit from SoftDeleteManager or combine them.
    # Let's define a custom manager that inherits SoftDeleteManager.
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = "Tour Service"
        verbose_name_plural = "Tour Services"
        ordering = ['-created_at']

class TourGalleryImage(models.Model):
    """
    Additional images for a tour service.
    """
    tour = models.ForeignKey(TourService, related_name='gallery_images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='tours/gallery/', validators=[validate_image_size])
    caption = models.CharField(max_length=200, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']
