# -*- coding: utf-8 -*-
# Generated by Django 1.11.6 on 2017-11-09 07:08
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='LiftedKey',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('vertical_name', models.TextField()),
                ('vertical_category_name', models.TextField()),
            ],
        ),
        migrations.CreateModel(
            name='LiftedTechKey',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('category_name', models.TextField()),
            ],
        ),
        migrations.CreateModel(
            name='ScrapedCourse',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('is_new', models.BooleanField()),
                ('name', models.TextField()),
                ('url', models.TextField()),
                ('public_cpd', models.FloatField(null=True)),
                ('cost', models.FloatField(null=True)),
                ('spider_name', models.TextField()),
                ('provider', models.TextField(null=True)),
                ('level', models.TextField(null=True)),
                ('lifted_keys', models.ManyToManyField(to='cms.LiftedKey')),
                ('lifted_tech_keys', models.ManyToManyField(to='cms.LiftedTechKey')),
            ],
        ),
        migrations.CreateModel(
            name='ScrapedCourseDate',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('start', models.DateTimeField()),
                ('end', models.DateTimeField(null=True)),
                ('scraped_course', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='cms.ScrapedCourse')),
            ],
        ),
    ]
