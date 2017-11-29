"""
Loaded by 0001_initial.py to load initial data from ODS files in
lifted_framework_data/
"""
from app.lifted_framework_data import extract_framework_data
from django.core.exceptions import ObjectDoesNotExist


def load(apps, schema_editor):
    """
    Parse data from the ODS files in lifted_framework_data/ and store
    it in the DB
    """

    TechCompetencyCategory = apps.get_model("app", "TechCompetencyCategory")
    TechCompetency = apps.get_model("app", "TechCompetency")
    TechRoleCompetency = apps.get_model("app", "TechRoleCompetency")
    CourseTechCompetency = apps.get_model("app", "CourseTechCompetency")
    TechRole = apps.get_model("app", "TechRole")
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
    Competency = apps.get_model("app", "Competency")
    CourseCompetency = apps.get_model("app", "CourseCompetency")
    CompetencyCategory = apps.get_model("app", "CompetencyCategory")
    JobRole = apps.get_model("app", "JobRole")
    JobRoleCompetency = apps.get_model("app", "JobRoleCompetency")
    Specialism = apps.get_model("app", "Specialism")

    # Parse and save the tech roles
    parsed_tech_roles = extract_framework_data.parse_tech_roles()
    for i, role in enumerate(parsed_tech_roles):
        tech_role = TechRole(
                id=i,
                name=role["Role"],
                role_level=role["Level"],
                option=role["Copyedited role"])

        tech_role.save()

    # parse and save the tech competencies
    for i, tech_comp in enumerate(
            extract_framework_data.parse_tech_competencies()):
        tech_role = TechRole.objects.get(name=tech_comp["Tech role"])

        # Find / create the tech competency category
        tech_comp_cat = None
        try:
            tech_comp_cat = TechCompetencyCategory.objects.get(
                    tech_role=tech_role,
                    name=tech_comp["Competency category"])
        except ObjectDoesNotExist as e:
            tech_comp_cat = TechCompetencyCategory(
                    tech_role=tech_role,
                    name=tech_comp["Competency category"])
            tech_comp_cat.save()

        tech_comp = TechCompetency(
                id=tech_comp["ID"],
                category=tech_comp_cat,
                copy_title=tech_comp["Copyedited title"],
                full_desc=tech_comp["Description"])
        tech_comp.save()

    for i, tech_role in enumerate(parsed_tech_roles):
        role = TechRole.objects.get(name=tech_role["Role"])
        for comp_id in tech_role["Tech Competency IDs"]:
            comp = TechCompetency.objects.get(id=comp_id)
            tech_role_comp = TechRoleCompetency(
                    tech_role=role,
                    tech_competency=comp)
            tech_role_comp.save()


    # Verticals and competency categories
    i = 1
    j = 1
    verticals = []
    categories = []

    for vertical in extract_framework_data.parse_verticals():
        vert = Vertical(id=i, name=vertical["Vertical"],
                        option=vertical["Vertical option text"])
        verticals.append(vert)

        for category in vertical["categories"]:
            vert_cat = VerticalCategory(id=j, vertical=vert,
                                        key=category["Category key"],
                                        name=category["Category title"],
                                        option=category["Option text"])
            categories.append(vert_cat)
            j += 1
        i += 1


    # Levels
    levels = []
    for lvl in extract_framework_data.parse_levels():
        levels.append(Level(name=lvl["Level"], acronym=lvl["Acronym"]))

    # Venues
    venues = []
    for venue in extract_framework_data.parse_venues():
        venues.append(Venue(name=venue["Venue"], acronym=venue["Acronym"]))

    # Formats

    formats = []
    for fmt in extract_framework_data.parse_formats():
        formats.append(Format(name=fmt["Format"], acronym=fmt["Acronym"]))

    # Funding types
    funding_types = []
    for funding_type in extract_framework_data.parse_funding_types():
        funding_types.append(Funding(funding_type=funding_type))

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

    for parsed_need in parsed_needs:
        for need_level in parsed_need["Levels"]:
            for level in levels:
                if level.acronym == need_level:
                    need = Need.objects.get(name__exact=parsed_need["Need"])
                    need_levels.append(NeedLevel(need=need, level=level))
                    break

        for need_format in parsed_need["Formats"]:
            for fmt in formats:
                if fmt.acronym == need_format:
                    need = Need.objects.get(name__exact=parsed_need["Need"])
                    need_formats.append(NeedFormat(need=need, format=fmt))
                    break

    NeedLevel.objects.using(db_alias).bulk_create(need_levels)
    NeedFormat.objects.using(db_alias).bulk_create(need_formats)

    # CompetencyCategory
    comp_categories = extract_framework_data.parse_competency_categories()
    for vertical, cats in comp_categories.items():
        vertical = Vertical.objects.get(name=vertical)
        for category in cats:
            comp_cat = CompetencyCategory(vertical=vertical, name=category)
            comp_cat.save()

    # Specialisms
    specialisms = extract_framework_data.parse_specialisms()
    for specialism in specialisms:
        sp = Specialism(name=specialism)
        sp.save()

    # Competencies
    competencies = extract_framework_data.parse_competencies()
    for competency in competencies:
        vertical = Vertical.objects.get(name=competency["Vertical"])
        competency_category = CompetencyCategory.objects.get(
            vertical=vertical,
            name=competency["Competency Category"])

        specialism = None
        specialism_name = competency["Specialism"]

        if specialism_name is not None:
            specialism = Specialism.objects.get(name=competency["Specialism"])

        competency = Competency(id=competency["ID"],
                                vertical=vertical,
                                specialism=specialism,
                                copy_title=competency["Copyedited title"],
                                category=competency_category,
                                full_desc=competency["Description"])
        competency.save()

    # Job Roles
    job_roles = extract_framework_data.parse_job_roles()
    for job_role in job_roles:
        specialism = None

        print(job_role)
        if "Specialism" in job_role.keys() and \
                len(job_role["Specialism"].strip()) > 0:
            specialism = Specialism.objects.get(name=job_role["Specialism"])

        vertical = Vertical.objects.get(name=job_role["Vertical"])
        jr_obj = JobRole(name=job_role["Role"],
                         role_level=job_role["Level"],
                         org_type=job_role["In-house or law firm?"],
                         vertical=vertical,
                         specialism=specialism,
                         thin_desc=job_role["Thin Description"])
        jr_obj.save()

        for competency_id in job_role["Competency Ids"]:
            comp = Competency.objects.get(id=competency_id)
            jrc = JobRoleCompetency(job_role=jr_obj, competency=comp)
            jrc.save()


    # Courses
    parsed_courses = extract_framework_data.parse_courses()
    for c in parsed_courses:
        course = Course(name=c["Name"], cost=c["Cost"],
                        spider_name="LIFTED booklet",
                        url=c["URL"], duration=c["Duration (days)"])
        course.save()

        # CPD points
        cpd_points = 0
        is_private = False
        if "Est. CPD points" not in c.keys():
            cpd_points = None
        else:
            cpd_points = c["Est. CPD points"]

        if cpd_points == "Pte":
            is_private = True
            cpd_points = 0
        elif cpd_points == "":
            cpd_points = 0

        course_cpd_points = CourseCpdPoints(course=course, points=cpd_points,
                                            is_private=is_private)
        course_cpd_points.save()

        # Venue
        venue = Venue.objects.get(acronym__exact=c["Venue"])
        course_venue = CourseVenue(course=course, venue=venue)
        course_venue.save()

        # Start dates
        for start_date in c["Start dates (2017)"]:
            csd = CourseStartDate(course=course, start_date=start_date)
            csd.save()

        # Funding
        for funding in c["Available Funding"]:
            funding_type = Funding.objects.get(funding_type=funding)
            course_funding = CourseFunding(course=course, funding_type=funding_type)
            course_funding.save()

        # Format
        fmt = Format.objects.get(acronym=c["Format"])
        course_format = CourseFormat(course=course, format=fmt)
        course_format.save()

        # Level
        lvl = Level.objects.get(acronym=c["Training Level"])
        course_level = CourseLevel(course=course, level=lvl)
        course_level.save()

        # Vertical categories
        vertical_names = ["Legal Practitioner", "In-House Counsel",
                          "Legal Support"]

        for name in vertical_names:
            key = c[name]
            if key:
                vertical = Vertical.objects.get(name=name)
                vert_cat = VerticalCategory.objects.get(key=key, vertical=vertical)
                cvc = CourseVerticalCategory(course=course,
                                             vertical_category=vert_cat)
                cvc.save()

        # Competencies
        competencies = c["Competencies"]
        for competency_id in competencies:
            competency = Competency.objects.get(id=competency_id)
            course_comp = CourseCompetency(course=course, competency=competency)
            course_comp.save()

        tech_competencies = c["Tech Competencies"]
        for id in tech_competencies:
            tech_competency = TechCompetency.objects.get(id=id)
            course_tech_comp = CourseTechCompetency(course=course,
                    tech_competency=tech_competency)
            course_tech_comp.save()
