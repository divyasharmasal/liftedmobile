from django.contrib.auth.models import User
from django.utils import timezone
from cms import settings


def create(apps, schema_editor):
    User.objects.create_superuser(username=settings.CMS_TEMP_SUPER_USERNAME,
                                  password=settings.CMS_TEMP_SUPER_PASSWORD,
                                  last_login=timezone.now(), email="")
