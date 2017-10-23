from django.contrib.auth.models import User
from django.utils import timezone
from cms import settings


def create(apps, schema_editor):
    """
    Creates predefined users. The passwords differ depending on
    whether the app runs in dev or prod.
    """
    User.objects.create_superuser(username=settings.CMS_TEMP_SUPER_USERNAME,
                                  password=settings.CMS_TEMP_SUPER_PASSWORD,
                                  last_login=timezone.now(), email="")
