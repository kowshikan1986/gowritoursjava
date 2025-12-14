from django.core.exceptions import ValidationError

def validate_image_size(image):
    file_size = image.size
    limit_mb = 5
    if file_size > limit_mb * 1024 * 1024:
        raise ValidationError(f"Max size of file is {limit_mb} MB")

def validate_image_dimensions(image):
    # This requires opening the image, handled by Django's ImageField typically,
    # but for strict validation we can use Pillow here if needed.
    # For now, relying on ImageField's built-in validation for valid image file.
    pass
