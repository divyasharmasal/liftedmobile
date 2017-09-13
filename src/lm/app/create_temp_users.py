from django.contrib.auth.models import User
from django.utils import timezone
from lm import settings

def create(apps, schema_editor):
    User.objects.create_superuser(username=settings.LIFTED_TEMP_SUPER_USERNAME,
                                  password=settings.LIFTED_TEMP_SUPER_PASSWORD,
                                  last_login=timezone.now(), email="")
    User.objects.create_user(username=settings.LIFTED_TEMP_USERNAME,
                             password=settings.LIFTED_TEMP_PASSWORD,
                             last_login=timezone.now(), email="")
    User.objects.create_user(username=settings.LIFTED_TEMP_DEMO_USERNAME,
                             password=settings.LIFTED_TEMP_DEMO_PASSWORD,
                             last_login=timezone.now(), email="")
