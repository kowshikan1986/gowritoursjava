from django.core.management.base import BaseCommand
from tours.models import TourCategory
from django.core.files.base import ContentFile
import requests

class Command(BaseCommand):
    help = 'Populates the database with initial tour categories from servicesData.js'

    def handle(self, *args, **kwargs):
        categories = [
            {
                'name': 'UK Tours',
                'slug': 'uk-tours',
                'description': 'Discover the magic of the United Kingdom with our exclusive tour packages.',
                # Image will be handled manually or skipped if not provided, 
                # user can upload in admin.
            },
            {
                'name': 'European Tours',
                'slug': 'european-tours',
                'description': 'Experience the art, culture, and cuisine of Europe\'s finest destinations.',
            },
            {
                'name': 'World Tours',
                'slug': 'world-tours',
                'description': 'Go beyond boundaries with our curated tours to exotic global destinations.',
            },
            {
                'name': 'India & Sri Lankan Tours',
                'slug': 'india-sri-lanka-tours',
                'description': 'Journey through the vibrant cultures and landscapes of South Asia.',
            },
            {
                'name': 'Group Tours',
                'slug': 'group-tours',
                'description': 'Join like-minded travelers on our expertly planned group expeditions.',
            },
            {
                'name': 'Private Tours',
                'slug': 'private-tours',
                'description': 'Bespoke itineraries designed exclusively for you and your companions.',
            },
            {
                'name': 'Airport Transfers',
                'slug': 'airport-transfers',
                'description': 'Seamless and comfortable transfers to start your journey right.',
            },
            {
                'name': 'Vehicle Hire',
                'slug': 'vehicle-hire',
                'description': 'Rent premium vehicles for your self-drive adventures or chauffeur needs.',
            },
            {
                'name': 'Cruises',
                'slug': 'cruises',
                'description': 'Set sail on luxurious ocean and river cruises around the world.',
            }
        ]

        for cat_data in categories:
            category, created = TourCategory.objects.get_or_create(
                slug=cat_data['slug'],
                defaults={
                    'name': cat_data['name'],
                    'description': cat_data['description']
                }
            )
            
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created category: {category.name}'))
            else:
                self.stdout.write(self.style.WARNING(f'Category already exists: {category.name}'))
                # Optional: Update description if needed
                # category.description = cat_data['description']
                # category.save()

        self.stdout.write(self.style.SUCCESS('Successfully populated categories'))
