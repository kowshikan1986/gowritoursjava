from django.shortcuts import render
from rest_framework import viewsets, filters
from .models import TourService, TourCategory, TourSubCategory
from .serializers import TourServiceSerializer, TourCategorySerializer, TourSubCategorySerializer

class TourCategoryViewSet(viewsets.ModelViewSet):
    queryset = TourCategory.objects.all()
    serializer_class = TourCategorySerializer
    lookup_field = 'slug'

class TourSubCategoryViewSet(viewsets.ModelViewSet):
    queryset = TourSubCategory.objects.all()
    serializer_class = TourSubCategorySerializer
    lookup_field = 'slug'

class TourServiceViewSet(viewsets.ModelViewSet):
    serializer_class = TourServiceSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'location']
    ordering_fields = ['price', 'created_at']
    lookup_field = 'slug'

    def get_queryset(self):
        """
        Show all tours to staff; only active, non-deleted tours to public.
        """
        user = getattr(self.request, "user", None)
        if user and getattr(user, "is_staff", False):
            return TourService.all_objects.all()
        return TourService.objects.filter(is_active=True)
