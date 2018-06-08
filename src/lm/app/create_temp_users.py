from django.contrib.auth.models import User
from django.utils import timezone
from lm import settings


def create(apps, schema_editor):
    """
    Creates predefined users. The passwords differ depending on
    whether the app runs in dev or prod.
    """
    pass
    # User.objects.create_superuser(username=settings.LIFTED_TEMP_SUPER_USERNAME,
                                  # password=settings.LIFTED_TEMP_SUPER_PASSWORD,
                                  # last_login=timezone.now(), email="")

    # User.objects.create_user(username=settings.LIFTED_TEMP_USERNAME,
                             # password=settings.LIFTED_TEMP_PASSWORD,
                             # is_staff=True,
                             # last_login=timezone.now(), email="")
