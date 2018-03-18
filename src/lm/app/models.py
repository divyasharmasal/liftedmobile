from django.db import models

# Initial data files are stored in src/lm/app/lifted_framework_data/

# Legal-tech-specific models:
#######################

class TechRole(models.Model):
    """Legal tech roles: innovator / enabler / user
    Data from: tech_roles.ods
    """
    id = models.IntegerField(primary_key=True)
    name = models.TextField(unique=True)
    role_level = models.IntegerField(null=True)
    option = models.TextField(unique=True)


class TechCompetencyCategory(models.Model):
    """Legal tech competency categories, such as:

    - Understanding & Solutioning
    - Technology Literacy & Advocacy
    - Entrepreneurship & Collaboration
    - Digital Security & Data Governance

    Data from: tech_competencies.ods
    """
    id = models.AutoField(primary_key=True)
    name = models.TextField()
    tech_role = models.ForeignKey(TechRole, on_delete=models.CASCADE)


class TechCompetency(models.Model):
    """Legal tech tech competency titles and descriptions. These competencies
    are directly used in the diagnostic quizzes.
    Data from: tech_competencies.ods
    """
    id = models.IntegerField(primary_key=True)
    category = models.ForeignKey(TechCompetencyCategory, on_delete=models.CASCADE)
    copy_title = models.TextField()
    full_desc = models.TextField()


class TechRoleCompetency(models.Model):
    """Links TechRole entries and TechCompetency entries.
    Data from: tech_roles.ods -> "Tech Competency IDs" column
    """
    class Meta:
        unique_together = (("tech_role", "tech_competency"))
    tech_role = models.ForeignKey(TechRole, on_delete=models.CASCADE)
    tech_competency = models.ForeignKey(TechCompetency, on_delete=models.CASCADE)

# General LIFTED Framework models
#######################

class Vertical(models.Model):
    """Legal industry verticals. Used as the first question in the learning needs review.
    The three verticals are:
        - practicing lawyer
        - in-house counsel
        - legal support

    Data from: verticals.ods
    """
    id = models.IntegerField(primary_key=True)
    name = models.TextField(unique=True)
    option = models.TextField(unique=True)


class VerticalCategory(models.Model):
    """Each vertical has 7 or 8 categories, including "Technical Lawyering",
    "Leadership, Business & Strategy", and "Legal Operations. These vertical
    categories are used as the second question in the quiz ("I want to develop
    my...").

    Data from: verticals.ods
    """
    class Meta:
        unique_together = (("key", "vertical"))
    id = models.IntegerField(primary_key=True)
    key = models.IntegerField()
    name = models.TextField() # e.g. Technical Lawyering
    option = models.TextField() # e.g. Administration and problem-solving
    vertical = models.ForeignKey(Vertical, on_delete=models.CASCADE)


class Venue(models.Model):
    """Obsolete.

    Data from: venues.ods
    """
    acronym = models.TextField(primary_key=True)
    name = models.TextField(unique=True)


class Format(models.Model):
    """Course formats. e.g. Conference / Workshop / Seminar
    Data from: formats.ods
    """
    acronym = models.TextField(primary_key=True)
    name = models.TextField(unique=True)


class Level(models.Model):
    """Course levels. e.g. General / Foundational / Advanced
    Not to be confused with job role levels
    Data from: levels.ods
    """
    acronym = models.TextField(primary_key=True)
    name = models.TextField(unique=True)


class Need(models.Model):
    """A unique combination of formats and levels. If a course has a particular
    format and is at a particular level, and if a need fits this bill, then the
    course can be said to fit this need.
    e.g. "Acquire baseline skills" or "Establish a functional understanding of
    various subjects".

    Data from: needs.ods
    """
    id = models.AutoField(primary_key=True)
    name = models.TextField(unique=True)
    option = models.TextField(unique=True)


class NeedFormat(models.Model):
    """Links Needs with Formats.

    Data from: needs.ods
    """

    class Meta:
        unique_together = (("need", "format"))

    id = models.AutoField(primary_key=True)
    need = models.ForeignKey(Need, on_delete=models.CASCADE)
    format = models.ForeignKey(Format, on_delete=models.CASCADE)


class NeedLevel(models.Model):
    """Links Needs with Levels.

    Data from: needs.ods
    """

    class Meta:
        unique_together = (("need", "level"))

    id = models.AutoField(primary_key=True)
    need = models.ForeignKey(Need, on_delete=models.CASCADE)
    level = models.ForeignKey(Level, on_delete=models.CASCADE)


class Funding(models.Model):
    """Obsolete.
    """
    funding_type = models.TextField(primary_key=True)


class Course(models.Model):
    """Model for published course data.

    Read by the app, and read & written to by the CMS.
    """
    id = models.AutoField(primary_key=True)
    name = models.TextField()
    cost = models.DecimalField(decimal_places=2, max_digits=11, null=True)
    duration = models.DecimalField(null=True, decimal_places=1, max_digits=6)
    url = models.TextField(null=True)
    spider_name = models.TextField(null=True)
    provider = models.TextField(null=True)
    is_manually_added = models.NullBooleanField(null=True)
    cost_is_varying = models.NullBooleanField(null=True)
    is_ongoing = models.NullBooleanField(null=True)


class CourseVerticalCategory(models.Model):
    """Links courses to vertical categories.
    """
    class Meta:
        unique_together = (("course", "vertical_category"))
    id = models.AutoField(primary_key=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    vertical_category = models.ForeignKey(VerticalCategory, on_delete=models.CASCADE)


class CourseFormat(models.Model):
    """Links courses to formats.
    """
    class Meta:
        unique_together = (("course", "format"))
    id = models.AutoField(primary_key=True)
    course = models.OneToOneField(Course, on_delete=models.CASCADE)
    format = models.ForeignKey(Format, on_delete=models.CASCADE)


class CourseLevel(models.Model):
    """Links courses to levels.
    """
    class Meta:
        unique_together = (("course", "level"))
    id = models.AutoField(primary_key=True)
    course = models.OneToOneField(Course, on_delete=models.CASCADE)
    level = models.ForeignKey(Level, on_delete=models.CASCADE)


class CourseVenue(models.Model):
    """Obsolete.
    """
    class Meta:
        unique_together = (("course", "venue"))
    id = models.AutoField(primary_key=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    venue = models.ForeignKey(Venue, on_delete=models.CASCADE)


class CourseDate(models.Model):
    """Some courses have multiple dates, so this model links courses to dates.
    The course browser queries this model so that it gets one course entry per
    date.
    """
    class Meta:
        unique_together = (("course", "start", "end"))
    id = models.AutoField(primary_key=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    start = models.DateTimeField(null=False)
    end = models.DateTimeField(null=True)


class CourseFunding(models.Model):
    """Obsolete.
    """
    class Meta:
        unique_together = (("course", "funding_type"))
    id = models.AutoField(primary_key=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    funding_type = models.ForeignKey(Funding, on_delete=models.CASCADE)


class CourseCpdPoints(models.Model):
    """Each course can have different kinds of CPD points:
        - public points: if a course gives public points, the number of public
          points is specified in the points field
        - private points: is_private should be True
        - is_na: a course without point information
        - is_tbc: a course with pending point information
    """
    id = models.AutoField(primary_key=True)
    course = models.OneToOneField(Course, on_delete=models.CASCADE)
    points = models.DecimalField(decimal_places=2, max_digits=6, null=True)
    is_private = models.BooleanField()
    is_na = models.BooleanField()
    is_tbc = models.BooleanField()


class CompetencyCategory(models.Model):
    """Legal job competency categories, such as:
    - Administration & Productivity
    - Communication & Teamwork
    - Professionalism & Service

    Data from: competencies.ods
    """

    class Meta:
        unique_together = (("vertical", "name"))
    id = models.AutoField(primary_key=True)
    name = models.TextField()
    vertical = models.ForeignKey(Vertical, on_delete=models.CASCADE)


class Specialism(models.Model):
    """Some job roles have specialisms, such as:
    - Community / Public Interest
    - Corporate / Commercial

    Data from: job_roles.ods
    """
    id = models.AutoField(primary_key=True)
    name = models.TextField(unique=True)


class Competency(models.Model):
    """Data for competency titles and descriptions in the LIFTED framework.

    Data from: competencies.ods
    """
    id = models.IntegerField(primary_key=True)
    vertical = models.ForeignKey(Vertical, on_delete=models.CASCADE)
    category = models.ForeignKey(CompetencyCategory, on_delete=models.CASCADE)
    specialism = models.ForeignKey(Specialism, null=True, on_delete=models.CASCADE)
    copy_title = models.TextField()
    full_desc = models.TextField(null=True)


class CourseCompetency(models.Model):
    """
    Links Courses to Competencies.
    """
    class Meta:
        unique_together = (("course", "competency"))
    id = models.AutoField(primary_key=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    competency = models.ForeignKey(Competency, on_delete=models.CASCADE)


class JobRole(models.Model):
    """Data about job roles.
    """
    id = models.AutoField(primary_key=True)
    name = models.TextField(unique=True)
    role_level = models.IntegerField(null=True)
    org_type = models.TextField()
    thin_desc = models.TextField(null=True)
    vertical = models.ForeignKey(Vertical, on_delete=models.CASCADE)
    specialism = models.ForeignKey(Specialism, null=True, 
                                   on_delete=models.CASCADE)


class JobRoleCompetency(models.Model):
    """Links job roles to competencies.
    """
    class Meta:
        unique_together = (("job_role", "competency"))
    job_role = models.ForeignKey(JobRole, on_delete=models.CASCADE)
    competency = models.ForeignKey(Competency, on_delete=models.CASCADE)


class CourseTechCompetency(models.Model):
    """Links courses to legal tech competencies.
    """
    class Meta:
        unique_together = (("course", "tech_competency"))
    id = models.AutoField(primary_key=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    tech_competency = models.ForeignKey(TechCompetency,
                                        on_delete=models.CASCADE)


class CourseTechCompetencyCategory(models.Model):
    """Links courses to legal tech competency categories.
    """
    class Meta:
        unique_together = (("course", "tech_competency_category"))
    id = models.AutoField(primary_key=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    tech_competency_category = models.ForeignKey(TechCompetencyCategory,
            on_delete=models.CASCADE)
