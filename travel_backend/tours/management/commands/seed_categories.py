from django.core.management.base import BaseCommand
from tours.models import TourCategory

class Command(BaseCommand):
    help = 'Seeds initial tour categories'

    def handle(self, *args, **options):
        categories = [
            'UK TOURS',
            'EUROPEAN TOURS',
            'WORLD TOUR',
            'INDIA , SRILANKAN TOUR',
            'GROUP TOURS',
            'PRIVATE TOURS',
            'AIRPORT TRANSFERS',
            'VEHICLE HIRE',
            'CRUISES'
        ]

        for cat_name in categories:
            category, created = TourCategory.objects.get_or_create(name=cat_name)
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created category: {cat_name}'))
            else:
                self.stdout.write(f'Category already exists: {cat_name}')
