from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from marketing.models import HeroBanner
import requests

DEFAULT_HEROES = [
    {
        'title': 'Extraordinary Journeys',
        'subtitle': "Discover the world's most exclusive destinations with personalized luxury travel experiences crafted to perfection for the discerning traveler.",
        'cta_text': 'Explore Destinations',
        'cta_link': '',
        'image_url': 'https://images.unsplash.com/photo-1540541338287-41700207dee6?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
        'priority': 1,
    },
    {
        'title': 'Curated Luxury Escapes',
        'subtitle': 'Handpicked retreats and iconic routes designed for comfort and style.',
        'cta_text': 'Start Planning',
        'cta_link': '',
        'image_url': 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
        'priority': 2,
    },
]


class Command(BaseCommand):
    help = 'Seed default hero banners so current hero images are visible/manageable in Admin'

    def handle(self, *args, **options):
        created_count = 0
        for item in DEFAULT_HEROES:
            banner, created = HeroBanner.objects.get_or_create(
                title=item['title'],
                defaults={
                    'subtitle': item['subtitle'],
                    'cta_text': item['cta_text'],
                    'cta_link': item['cta_link'],
                    'priority': item['priority'],
                    'is_active': True,
                }
            )

            # If created, download and attach image
            if created or not banner.background_image:
                try:
                    resp = requests.get(item['image_url'], timeout=20)
                    resp.raise_for_status()
                    filename = f"hero_{item['priority']}.jpg"
                    banner.background_image.save(filename, ContentFile(resp.content), save=True)
                    self.stdout.write(self.style.SUCCESS(f"Attached image for: {banner.title}"))
                except Exception as e:
                    self.stdout.write(self.style.WARNING(f"Failed to fetch image for {banner.title}: {e}"))

            if created:
                created_count += 1

        self.stdout.write(self.style.SUCCESS(f"Hero banners ready. New created: {created_count}"))

