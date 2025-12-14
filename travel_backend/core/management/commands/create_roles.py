from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from marketing.models import SiteLogo, Advertisement
from tours.models import TourService

class Command(BaseCommand):
    help = 'Creates default user roles and permissions'

    def handle(self, *args, **options):
        # Content Manager: Manages Tours
        content_manager, _ = Group.objects.get_or_create(name='ContentManager')
        tour_ct = ContentType.objects.get_for_model(TourService)
        # Add 'view', 'add', 'change', 'delete' permissions
        tour_perms = Permission.objects.filter(content_type=tour_ct)
        content_manager.permissions.set(tour_perms)
        self.stdout.write(self.style.SUCCESS('ContentManager group created/updated with TourService permissions'))

        # Marketing Manager: Manages Logos and Ads
        marketing_manager, _ = Group.objects.get_or_create(name='MarketingManager')
        logo_ct = ContentType.objects.get_for_model(SiteLogo)
        ad_ct = ContentType.objects.get_for_model(Advertisement)
        marketing_perms = Permission.objects.filter(content_type__in=[logo_ct, ad_ct])
        marketing_manager.permissions.set(marketing_perms)
        self.stdout.write(self.style.SUCCESS('MarketingManager group created/updated with Marketing permissions'))
