# -*- coding: utf-8 -*-
# Generated by Django 1.11.7 on 2018-01-11 16:48
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0002_load_initial_data'),
    ]

    operations = [
        migrations.AddField(
            model_name='course',
            name='is_ongoing',
            field=models.NullBooleanField(),
        ),
    ]