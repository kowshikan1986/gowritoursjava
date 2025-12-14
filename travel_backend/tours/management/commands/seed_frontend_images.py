from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from tours.models import TourCategory, TourService
import requests

CATEGORY_IMAGES = {
    'uk-tours': 'https://images.unsplash.com/photo-1505761671935-60b3a7427bad?q=80&w=1470&auto=format&fit=crop',
    'european-tours': 'https://images.unsplash.com/photo-1508057198894-247b23fe5ade?q=80&w=1470&auto=format&fit=crop',
    'world-tours': 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1470&auto=format&fit=crop',
    'india-sri-lanka-tours': 'https://images.unsplash.com/photo-1599059056432-5f1535f327f3?q=80&w=1470&auto=format&fit=crop',
    'group-tours': 'https://images.unsplash.com/photo-1520975916090-31059506c643?q=80&w=1470&auto=format&fit=crop',
    'private-tours': 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=1470&auto=format&fit=crop',
    'airport-transfers': 'https://images.unsplash.com/photo-1555215696-99ac45e43d34?q=80&w=1374&auto=format&fit=crop',
    'vehicle-hire': 'https://images.unsplash.com/photo-1483721310020-03333e577078?q=80&w=1470&auto=format&fit=crop',
    'cruises': 'https://images.unsplash.com/photo-1580636857485-e2471a973e95?q=80&w=1470&auto=format&fit=crop',
}

TOUR_IMAGES = {
    'lake-district': 'https://images.unsplash.com/photo-1527258654576-0fb8fdfaf6b9?q=80&w=1470&auto=format&fit=crop',
    'scotland': 'https://images.unsplash.com/photo-1505764702709-0cfa90f3f539?q=80&w=1470&auto=format&fit=crop',
    'cornwall': 'https://images.unsplash.com/photo-1515706886585-49f3a5b0a4b0?q=80&w=1470&auto=format&fit=crop',
    'wales': 'https://images.unsplash.com/photo-1502810190503-830027c1d51e?q=80&w=1470&auto=format&fit=crop',
    'isle-of-wight': 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1470&auto=format&fit=crop',
    'peak-district': 'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?q=80&w=1470&auto=format&fit=crop',
}

class Command(BaseCommand):
    help = 'Backfill images for categories and tours so all frontend images are visible in Admin'

    def _attach_image(self, obj, field_name, url, filename):
        try:
            resp = requests.get(url, timeout=25)
            resp.raise_for_status()
            getattr(obj, field_name).save(filename, ContentFile(resp.content), save=True)
            return True
        except Exception as e:
            self.stdout.write(self.style.WARNING(f"Failed {obj} -> {e}"))
            return False

    def handle(self, *args, **kwargs):
        # Categories
        for slug, url in CATEGORY_IMAGES.items():
            try:
                cat = TourCategory.objects.get(slug=slug)
                if not cat.image:
                    ok = self._attach_image(cat, 'image', url, f"category_{slug}.jpg")
                    if ok:
                        self.stdout.write(self.style.SUCCESS(f"Category image attached: {slug}"))
            except TourCategory.DoesNotExist:
                self.stdout.write(self.style.WARNING(f"Category missing: {slug}"))

        # Tours
        for slug, url in TOUR_IMAGES.items():
            try:
                tour = TourService.objects.get(slug=slug)
                if not tour.featured_image:
                    ok = self._attach_image(tour, 'featured_image', url, f"tour_{slug}.jpg")
                    if ok:
                        self.stdout.write(self.style.SUCCESS(f"Tour image attached: {slug}"))
            except TourService.DoesNotExist:
                self.stdout.write(self.style.WARNING(f"Tour missing: {slug}"))

        self.stdout.write(self.style.SUCCESS('Images backfill complete'))

