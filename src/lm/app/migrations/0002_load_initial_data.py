# -*- coding: utf-8 -*-
# Generated by Django 1.11.2 on 2017-07-14 01:48
from __future__ import unicode_literals

from django.db import migrations
from .. import load_initial_data


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(load_initial_data.load)
    ]
