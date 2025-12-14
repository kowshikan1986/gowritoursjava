from rest_framework import serializers
from .models import SiteLogo, Advertisement, HeroBanner

class SiteLogoSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteLogo
        fields = ['id', 'title', 'image', 'is_active']

class AdvertisementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Advertisement
        fields = ['id', 'title', 'image', 'link_url', 'priority', 'start_date', 'end_date', 'is_active']


class HeroBannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = HeroBanner
        fields = ['id', 'title', 'subtitle', 'cta_text', 'cta_link', 'background_image', 'is_active', 'priority']
