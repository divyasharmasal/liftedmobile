from django.contrib.auth.models import User
from django.utils import timezone
from lm import settings


def create(apps, schema_editor):
    """
    Creates predefined users. The passwords differ depending on
    whether the app runs in dev or prod.
    """

    username = settings.CMS_TEMP_SUPER_USERNAME
    password = settings.CMS_TEMP_SUPER_PASSWORD

    if not User.objects.filter(username=username).exists():

        User.objects.create_superuser(
            username=username,
            password=password,
            last_login=timezone.now(),
            email="")
