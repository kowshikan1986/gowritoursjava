from django.contrib import admin
from django.utils.html import mark_safe
from .models import SiteLogo, Advertisement, HeroBanner

class BaseAdmin(admin.ModelAdmin):
    readonly_fields = ('created_at', 'updated_at', 'created_by')

    def save_model(self, request, obj, form, change):
        if not obj.pk:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)

@admin.register(SiteLogo)
class SiteLogoAdmin(BaseAdmin):
    list_display = ('title', 'image_preview', 'is_active', 'updated_at')
    list_filter = ('is_active',)
    search_fields = ('title',)
    ordering = ('-is_active', '-updated_at')

    def image_preview(self, obj):
        if obj.image:
            return mark_safe(f'<img src="{obj.image.url}" width="100" />')
        return "No Image"
    image_preview.short_description = "Preview"

    def has_change_permission(self, request, obj=None):
        # Example: Restrict active logo changes to SuperUser
        if obj and obj.is_active and not request.user.is_superuser:
             return False # Or logic to allow if in specific group
        return super().has_change_permission(request, obj)
    
    # Custom permission check for "activating" a logo could be here

@admin.register(Advertisement)
class AdvertisementAdmin(BaseAdmin):
    list_display = ('title', 'priority', 'start_date', 'end_date', 'is_active', 'status_display')
    list_filter = ('is_active', 'start_date', 'end_date')
    search_fields = ('title', 'link_url')
    ordering = ('priority', '-start_date')
    date_hierarchy = 'start_date'

    def status_display(self, obj):
        from django.utils import timezone
        now = timezone.now()
        if not obj.is_active:
            return "Inactive"
        if obj.start_date <= now <= obj.end_date:
            return "Live"
        if obj.start_date > now:
            return "Scheduled"
        return "Expired"
    status_display.short_description = "Status"


@admin.register(HeroBanner)
class HeroBannerAdmin(BaseAdmin):
    list_display = ('title', 'priority', 'is_active', 'updated_at', 'image_preview')
    list_filter = ('is_active',)
    search_fields = ('title', 'subtitle')

    def image_preview(self, obj):
        if obj.background_image:
            return mark_safe(f'<img src="{obj.background_image.url}" width="120" />')
        return 'No Image'
    image_preview.short_description = 'Background'
