from django.db import migrations, models
import marketing.validators
import django.db.models.deletion
from django.utils.text import slugify


class Migration(migrations.Migration):

    dependencies = [
        ('tours', '0002_tourcategory_tourservice_category'),
    ]

    operations = [
        migrations.CreateModel(
            name='TourSubCategory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Created At')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Updated At')),
                ('created_by', models.ForeignKey(blank=True, editable=False, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='toursubcategory_created', to='auth.user', verbose_name='Created By')),
                ('name', models.CharField(max_length=120)),
                ('slug', models.SlugField(blank=True, max_length=180, unique=True)),
                ('description', models.TextField(blank=True)),
                ('image', models.ImageField(blank=True, null=True, upload_to='subcategories/', validators=[marketing.validators.validate_image_size])),
                ('category', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='subcategories', to='tours.tourcategory', verbose_name='Parent Category')),
            ],
            options={
                'verbose_name': 'Tour Sub-Category',
                'verbose_name_plural': 'Tour Sub-Categories',
            },
        ),
        migrations.AlterUniqueTogether(
            name='toursubcategory',
            unique_together={('category', 'name')},
        ),
    ]

