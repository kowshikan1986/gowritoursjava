from django.core.management.base import BaseCommand
from django.utils.text import slugify
from tours.models import TourCategory, TourSubCategory


CATEGORY_DATA = {
    "UK Tours": [
        "London & Surrounds",
        "Lake District",
        "Scotland Highlights",
        "Wales & Snowdonia",
        "Cornwall & South West",
        "Peak District",
        "Isle of Wight",
    ],
    "European Tours": [
        "France (Paris, Riviera)",
        "Italy (Rome, Amalfi, Tuscany)",
        "Greece (Athens, Cyclades, Santorini)",
        "Switzerland (Alps, Lakes)",
        "Spain & Portugal Highlights",
    ],
    "World Tours": [
        "Middle East (Dubai, Abu Dhabi)",
        "Indian Ocean (Maldives, Mauritius, Seychelles)",
        "Africa (Safari, Cape Town)",
        "Americas (USA, Canada, Caribbean)",
        "Asia (Japan, Bali, Thailand)",
    ],
    "India & Sri Lankan Tours": [
        "Sri Lanka Classic",
        "India Golden Triangle",
        "Kerala Backwaters",
        "South India Heritage",
    ],
    "Group Tours": [
        "Fixed Departures",
        "Corporate & Incentives",
        "Student & Educational",
    ],
    "Private Tours": [
        "Bespoke Itineraries",
        "Family & Multi-Gen",
        "Honeymoon & Celebrations",
        "VIP Concierge",
    ],
}


class Command(BaseCommand):
    help = "Seed tour categories and subcategories based on predefined list."

    def handle(self, *args, **options):
        created_cats = 0
        created_subs = 0
        for cat_name, subs in CATEGORY_DATA.items():
            cat_slug = slugify(cat_name)
            category = (
                TourCategory.objects.filter(name=cat_name).first()
                or TourCategory.objects.filter(slug=cat_slug).first()
            )
            cat_created = False
            if not category:
                category = TourCategory(name=cat_name, slug=cat_slug, description="")
                category.save()
                cat_created = True
            else:
                updated = False
                if not category.slug:
                    category.slug = cat_slug
                    updated = True
                if category.name != cat_name:
                    category.name = cat_name
                    updated = True
                if updated:
                    category.save(update_fields=["name", "slug"])
            if cat_created:
                created_cats += 1
                self.stdout.write(self.style.SUCCESS(f"Created category: {cat_name}"))
            for sub_name in subs:
                sub, sub_created = TourSubCategory.objects.get_or_create(
                    category=category,
                    name=sub_name,
                    defaults={"description": ""},
                )
                if sub_created:
                    created_subs += 1
                    self.stdout.write(self.style.SUCCESS(f"  Created subcategory: {sub_name}"))

        self.stdout.write(
            self.style.SUCCESS(
                f"Seeding complete. Categories created: {created_cats}, subcategories created: {created_subs}"
            )
        )

