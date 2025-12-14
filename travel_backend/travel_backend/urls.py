from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from tours.views import TourServiceViewSet, TourCategoryViewSet, TourSubCategoryViewSet
from marketing.views import HeroBannerViewSet, AdvertisementViewSet, SiteLogoViewSet
from core.views import login_view, logout_view, me_view

router = DefaultRouter()
router.register(r'tours', TourServiceViewSet, basename='tour')
router.register(r'categories', TourCategoryViewSet, basename='category')
router.register(r'subcategories', TourSubCategoryViewSet, basename='subcategory')
router.register(r'hero-banners', HeroBannerViewSet, basename='hero')
router.register(r'ads', AdvertisementViewSet, basename='ads')
router.register(r'logos', SiteLogoViewSet, basename='logos')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/auth/login/', login_view, name='api-login'),
    path('api/auth/logout/', logout_view, name='api-logout'),
    path('api/auth/me/', me_view, name='api-me'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
