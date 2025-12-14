from rest_framework import serializers
from .models import TourService, TourGalleryImage, TourCategory, TourSubCategory

class TourGalleryImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = TourGalleryImage
        fields = ['image', 'caption', 'order']

class TourServiceSerializer(serializers.ModelSerializer):
    gallery_images = TourGalleryImageSerializer(many=True, read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = TourService
        fields = [
            'id', 'title', 'slug', 'description', 'price', 
            'duration', 'location', 'featured_image', 
            'gallery_images', 'is_active', 'is_featured',
            'category', 'category_name'
        ]

class TourSubCategorySerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=False, allow_null=True)
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = TourSubCategory
        fields = ['id', 'name', 'slug', 'description', 'image', 'category', 'category_name']

class TourCategorySerializer(serializers.ModelSerializer):
    # Use the related_name 'tours' from the ForeignKey in TourService
    tours = TourServiceSerializer(many=True, read_only=True)
    subcategories = TourSubCategorySerializer(many=True, read_only=True)
    image = serializers.ImageField(required=False, allow_null=True)
    
    class Meta:
        model = TourCategory
        fields = ['id', 'name', 'slug', 'image', 'description', 'tours', 'subcategories']
