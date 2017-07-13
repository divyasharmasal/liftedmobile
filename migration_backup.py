from __future__ import unicode_literals

from django.db import migrations
from ..lifted_framework_data import extract_framework_data


def load_mvp_data(apps, schema_editor):
    Vertical = apps.get_model("app", "Vertical")
    VerticalCategory = apps.get_model("app", "VerticalCategory")
    Level = apps.get_model("app", "Level")
    Venue = apps.get_model("app", "Venue")
    Format = apps.get_model("app", "Format")
    Need = apps.get_model("app", "Need")
    # Course = apps.get_model("app", "Course")

    i = 1
    j = 1
    verticals = []
    categories = []

    # Populate DB with data from the ODS files in lifted_framework_data/
    for vertical in extract_framework_data.parse_verticals():
        v = Vertical(id=i, name=vertical["Vertical"], 
                question=vertical["Vertical question text"])
        verticals.append(v)

        for category in vertical["categories"]:
            c = VerticalCategory(id=j, vertical=v,
                    name=category["Category title"],
                    question=category["Category question text"])
            categories.append(c)
            j += 1
        i += 1

    levels = []
    for l in extract_framework_data.parse_levels():
        levels.append(Level(name=l["Level"], acronym=l["Acronym"]))

    venues = []
    for v in extract_framework_data.parse_venues():
        venues.append(Venue(name=v["Venue"], acronym=v["Acronym"]))

    formats = []
    for f in extract_framework_data.parse_formats():
        formats.append(Format(name=f["Format"], acronym=f["Acronym"]))

    db_alias = schema_editor.connection.alias
    Vertical.objects.using(db_alias).bulk_create(verticals)
    VerticalCategory.objects.using(db_alias).bulk_create(categories)
    Level.objects.using(db_alias).bulk_create(levels)


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0003_auto_20170713_1232'),
    ]

    operations = [
        migrations.RunPython(load_mvp_data)
    ]
