from rest_framework import viewsets, filters
from .models import HeroBanner, Advertisement, SiteLogo
from .serializers import HeroBannerSerializer, AdvertisementSerializer, SiteLogoSerializer

class HeroBannerViewSet(viewsets.ModelViewSet):
    serializer_class = HeroBannerSerializer
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['priority', 'updated_at']

    def get_queryset(self):
        """
        Staff can see all; public sees only active banners.
        """
        user = getattr(self.request, "user", None)
        if user and getattr(user, "is_staff", False):
            return HeroBanner.objects.all()
        return HeroBanner.objects.filter(is_active=True)

class AdvertisementViewSet(viewsets.ModelViewSet):
    queryset = Advertisement.objects.all()
    serializer_class = AdvertisementSerializer
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['priority', 'start_date']

class SiteLogoViewSet(viewsets.ModelViewSet):
    queryset = SiteLogo.objects.all()
    serializer_class = SiteLogoSerializer
