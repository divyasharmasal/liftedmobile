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
    Course = apps.get_model("app", "Course")
    CourseCpdPoints = apps.get_model("app", "CourseCpdPoints")
    CourseVenue = apps.get_model("app", "CourseVenue")
    CourseLevel = apps.get_model("app", "CourseLevel")
    CourseStartDate = apps.get_model("app", "CourseStartDate")
    CourseFormat = apps.get_model("app", "CourseFormat")
    CourseFunding = apps.get_model("app", "CourseFunding")
    CourseVerticalCategory = apps.get_model("app", "CourseVerticalCategory")

    i = 1
    j = 1
    verticals = []
    categories = []

    # Populate DB with data from the ODS files in lifted_framework_data/
    for vertical in extract_framework_data.parse_verticals():
        v = Vertical(id=i, name=vertical["Vertical"], 
                option=vertical["Vertical option text"])
        verticals.append(v)

        for category in vertical["categories"]:
            c = VerticalCategory(id=j, vertical=v,
                    key=category["Category key"],
                    name=category["Category title"],
                    option=category["Option text"])
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

    funding_types = []
    for f in extract_framework_data.parse_funding_types():
        funding_types.append(Funding(funding_type=f))

    db_alias = schema_editor.connection.alias
    Vertical.objects.using(db_alias).bulk_create(verticals)
    VerticalCategory.objects.using(db_alias).bulk_create(categories)
    Level.objects.using(db_alias).bulk_create(levels)
    Format.objects.using(db_alias).bulk_create(formats)
    Venue.objects.using(db_alias).bulk_create(venues)
    Funding.objects.using(db_alias).bulk_create(funding_types)

    needs = []
    parsed_needs = extract_framework_data.parse_needs()

    for n in parsed_needs:
        need = Need(name=n["Need"], option=n["Need option text"])
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

    parsed_courses = extract_framework_data.parse_courses()
    for c in parsed_courses:
        course = Course(name=c["Name"], cost=c["Cost"], duration=c["Duration (days)"])
        course.save()

        # CPD points
        cpd_points = None
        is_private = False
        if "Est. CPD points" not in c.keys():
            cpd_points = None
        else:
            cpd_points = c["Est. CPD points"]

        if cpd_points == "Pte":
            cpd_points = None
            is_private = True

        course_cpd_points = CourseCpdPoints(course=course, points=cpd_points, is_private=is_private)
        course_cpd_points.save()

        # Venue
        venue = Venue.objects.get(acronym__exact=c["Venue"])
        course_venue = CourseVenue(course=course, venue=venue)
        course_venue.save()

        # Start dates
        for start_date in c["Start dates (2017)"]:
            sd = CourseStartDate(course=course, start_date=start_date)
            sd.save()
        
        # Funding
        for funding in c["Available Funding"]:
            funding_type = Funding.objects.get(funding_type=funding)
            f = CourseFunding(course=course, funding_type=funding_type)
            f.save()
            
        # Format
        f = Format.objects.get(acronym=c["Format"])
        cf = CourseFormat(course=course, format=f)
        cf.save()

        # Level
        l = Level.objects.get(acronym=c["Training Level"])
        cl = CourseLevel(course=course, level=l)
        cl.save()
        
        # Vertical categories
        vertical_names = ["Legal Practitioner", "In-House Counsel", "Legal Support"]
        for vn in vertical_names:
            key = c[vn]
            if key:
                vertical = Vertical.objects.get(name=vn)
                vc = VerticalCategory.objects.get(key=key, vertical=vertical)
                cvc = CourseVerticalCategory(course=course, vertical_category=vc)
                cvc.save()
