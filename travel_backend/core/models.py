from django.db import models
from django.conf import settings
from django.utils import timezone

class AbstractBaseModel(models.Model):
    """
    Abstract base model that provides self-updating
    'created_at' and 'updated_at' fields.
    """
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created At")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Updated At")
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="%(class)s_created",
        verbose_name="Created By",
        editable=False  # System generated
    )

    class Meta:
        abstract = True

class SoftDeleteManager(models.Manager):
    """
    Manager that filters out soft-deleted items by default.
    """
    def get_queryset(self):
        return super().get_queryset().filter(is_deleted=False)

    def all_with_deleted(self):
        return super().get_queryset()

class SoftDeleteModel(models.Model):
    """
    Abstract model to add soft delete functionality.
    """
    is_deleted = models.BooleanField(default=False, verbose_name="Is Deleted")
    deleted_at = models.DateTimeField(null=True, blank=True, verbose_name="Deleted At")

    objects = SoftDeleteManager()
    all_objects = models.Manager()

    def delete(self, using=None, keep_parents=False):
        """
        Soft delete the object instead of removing it from DB.
        """
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save()

    def hard_delete(self):
        """
        Permanently delete the object.
        """
        super().delete()

    class Meta:
        abstract = True
