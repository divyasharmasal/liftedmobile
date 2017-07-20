from app.lifted_framework_data import extract_framework_data

def load(apps, schema_editor):
    Vertical = apps.get_model("app", "Vertical")
    VerticalCategory = apps.get_model("app", "VerticalCategory")
    Level = apps.get_model("app", "Level")
    Venue = apps.get_model("app", "Venue")
    Format = apps.get_model("app", "Format")
    Need = apps.get_model("app", "Need")
    NeedLevel = apps.get_model("app", "NeedLevel")
    NeedFormat = apps.get_model("app", "NeedFormat")
    Funding = apps.get_model("app", "Funding")
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
    Format.objects.using(db_alias).bulk_create(formats)
    Venue.objects.using(db_alias).bulk_create(venues)

    needs = []
    parsed_needs = extract_framework_data.parse_needs()

    for n in parsed_needs:
        need = Need(name=n["Need"], question=n["Need question text"])
        needs.append(need)

    Need.objects.using(db_alias).bulk_create(needs)

    need_levels = []
    need_formats = []

    for n in parsed_needs:
        for need_level in n["Levels"]:
            for level in levels:
                if level.acronym == need_level:
                    need = Need.objects.get(name__exact=n["Need"])
                    need_levels.append(NeedLevel(need=need, level=level))
                    break

        for need_format in n["Formats"]:
            for format in formats:
                if format.acronym == need_format:
                    need = Need.objects.get(name__exact=n["Need"])
                    need_formats.append(NeedFormat(need=need, format=format))
                    break

    NeedLevel.objects.using(db_alias).bulk_create(need_levels)
    NeedFormat.objects.using(db_alias).bulk_create(need_formats)
