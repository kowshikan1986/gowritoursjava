from django.contrib import admin
from django.utils.html import mark_safe
from .models import TourService, TourGalleryImage, TourCategory, TourSubCategory

@admin.register(TourCategory)
class TourCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'image_preview', 'created_at')
    search_fields = ('name',)
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ('created_at', 'updated_at', 'created_by')

    def image_preview(self, obj):
        if getattr(obj, 'image', None):
            return mark_safe(f'<img src="{obj.image.url}" width="120" />')
        return '—'
    image_preview.short_description = 'Image'

    def save_model(self, request, obj, form, change):
        if not obj.pk:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)

@admin.register(TourSubCategory)
class TourSubCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'slug', 'image_preview', 'created_at')
    search_fields = ('name', 'category__name')
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ('created_at', 'updated_at', 'created_by')
    list_filter = ('category',)

    def image_preview(self, obj):
        if getattr(obj, 'image', None):
            return mark_safe(f'<img src=\"{obj.image.url}\" width=\"120\" />')
        return '—'
    image_preview.short_description = 'Image'

    def save_model(self, request, obj, form, change):
        if not obj.pk:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)

class TourGalleryImageInline(admin.TabularInline):
    model = TourGalleryImage
    extra = 1
    fields = ('image', 'caption', 'order')

@admin.register(TourService)
class TourServiceAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'price', 'duration', 'image_preview', 'is_active', 'is_featured', 'is_deleted')
    list_filter = ('category', 'is_active', 'is_featured', 'is_deleted')
    search_fields = ('title', 'description', 'location', 'category__name')
    prepopulated_fields = {'slug': ('title',)}
    inlines = [TourGalleryImageInline]
    readonly_fields = ('created_at', 'updated_at', 'created_by')
    actions = ['restore_tours', 'hard_delete_tours']

    def image_preview(self, obj):
        if getattr(obj, 'featured_image', None):
            return mark_safe(f'<img src="{obj.featured_image.url}" width="120" />')
        return '—'
    image_preview.short_description = 'Featured'

    def get_queryset(self, request):
        # Show all items including deleted ones
        return self.model.all_objects.all()

    def save_model(self, request, obj, form, change):
        if not obj.pk:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)

    def delete_queryset(self, request, queryset):
        # Override bulk delete to soft delete
        for obj in queryset:
            obj.delete()

    @admin.action(description='Restore selected tours')
    def restore_tours(self, request, queryset):
        queryset.update(is_deleted=False, deleted_at=None)

    @admin.action(description='Permanently delete selected tours')
    def hard_delete_tours(self, request, queryset):
        # This will actually delete records from DB
        for obj in queryset:
            obj.hard_delete()
