from django.db import models


class TechRole(models.Model):
    id = models.IntegerField(primary_key=True)
    name = models.TextField(unique=True)
    role_level = models.IntegerField(null=True)
    option = models.TextField(unique=True)


class TechCompetencyCategory(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.TextField()
    tech_role = models.ForeignKey(TechRole, on_delete=models.CASCADE)


class TechCompetency(models.Model):
    id = models.IntegerField(primary_key=True)
    category = models.ForeignKey(TechCompetencyCategory, on_delete=models.CASCADE)
    copy_title = models.TextField()
    full_desc = models.TextField()


class TechRoleCompetency(models.Model):
    class Meta:
        unique_together = (("tech_role", "tech_competency"))
    tech_role = models.ForeignKey(TechRole, on_delete=models.CASCADE)
    tech_competency = models.ForeignKey(TechCompetency, on_delete=models.CASCADE)


class Vertical(models.Model):
    """
    Practicing lawyer, in-house counsel, legal support
    """
    id = models.IntegerField(primary_key=True)
    name = models.TextField(unique=True)
    option = models.TextField(unique=True)


class VerticalCategory(models.Model):
    class Meta:
        unique_together = (("key", "vertical"))
    id = models.IntegerField(primary_key=True)
    key = models.IntegerField()
    name = models.TextField() # e.g. Technical Lawyering
    option = models.TextField() # e.g. Administration and problem-solving
    vertical = models.ForeignKey(Vertical, on_delete=models.CASCADE)


class Venue(models.Model):
    acronym = models.TextField(primary_key=True)
    name = models.TextField(unique=True)


class Format(models.Model):
    acronym = models.TextField(primary_key=True)
    name = models.TextField(unique=True)


class Level(models.Model):
    """
    Course levels; not to be confused with job role levels
    """
    acronym = models.TextField(primary_key=True)
    name = models.TextField(unique=True)


class Need(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.TextField(unique=True)
    option = models.TextField(unique=True)


class NeedFormat(models.Model):
    class Meta:
        unique_together = (("need", "format"))

    id = models.AutoField(primary_key=True)
    need = models.ForeignKey(Need, on_delete=models.CASCADE)
    format = models.ForeignKey(Format, on_delete=models.CASCADE)


class NeedLevel(models.Model):
    class Meta:
        unique_together = (("need", "level"))

    id = models.AutoField(primary_key=True)
    need = models.ForeignKey(Need, on_delete=models.CASCADE)
    level = models.ForeignKey(Level, on_delete=models.CASCADE)


class Funding(models.Model):
    funding_type = models.TextField(primary_key=True)


class Course(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.TextField()
    cost = models.DecimalField(decimal_places=2, max_digits=11, null=True)
    duration = models.DecimalField(null=True, decimal_places=1, max_digits=6)
    url = models.TextField(null=True)
    spider_name = models.TextField(null=True)
    provider = models.TextField(null=True)
    is_manually_added = models.NullBooleanField(null=True)
    cost_is_varying = models.NullBooleanField(null=True)


class CourseVerticalCategory(models.Model):
    class Meta:
        unique_together = (("course", "vertical_category"))
    id = models.AutoField(primary_key=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    vertical_category = models.ForeignKey(VerticalCategory, on_delete=models.CASCADE)


class CourseFormat(models.Model):
    class Meta:
        unique_together = (("course", "format"))
    id = models.AutoField(primary_key=True)
    course = models.OneToOneField(Course, on_delete=models.CASCADE)
    format = models.ForeignKey(Format, on_delete=models.CASCADE)


class CourseLevel(models.Model):
    class Meta:
        unique_together = (("course", "level"))
    id = models.AutoField(primary_key=True)
    course = models.OneToOneField(Course, on_delete=models.CASCADE)
    level = models.ForeignKey(Level, on_delete=models.CASCADE)


class CourseVenue(models.Model):
    class Meta:
        unique_together = (("course", "venue"))
    id = models.AutoField(primary_key=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    venue = models.ForeignKey(Venue, on_delete=models.CASCADE)


class CourseDate(models.Model):
    class Meta:
        unique_together = (("course", "start", "end"))
    id = models.AutoField(primary_key=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    start = models.DateTimeField(null=False)
    end = models.DateTimeField(null=True)


class CourseFunding(models.Model):
    class Meta:
        unique_together = (("course", "funding_type"))
    id = models.AutoField(primary_key=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    funding_type = models.ForeignKey(Funding, on_delete=models.CASCADE)


class CourseCpdPoints(models.Model):
    id = models.AutoField(primary_key=True)
    course = models.OneToOneField(Course, on_delete=models.CASCADE)
    points = models.DecimalField(decimal_places=2, max_digits=6, null=True)
    is_private = models.BooleanField()
    is_tbc = models.BooleanField()


class CompetencyCategory(models.Model):
    class Meta:
        unique_together = (("vertical", "name"))
    id = models.AutoField(primary_key=True)
    name = models.TextField()
    vertical = models.ForeignKey(Vertical, on_delete=models.CASCADE)


class Specialism(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.TextField(unique=True)


class Competency(models.Model):
    id = models.IntegerField(primary_key=True)
    vertical = models.ForeignKey(Vertical, on_delete=models.CASCADE)
    category = models.ForeignKey(CompetencyCategory, on_delete=models.CASCADE)
    specialism = models.ForeignKey(Specialism, null=True, on_delete=models.CASCADE)
    copy_title = models.TextField()
    full_desc = models.TextField(null=True)


class CourseCompetency(models.Model):
    class Meta:
        unique_together = (("course", "competency"))
    id = models.AutoField(primary_key=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    competency = models.ForeignKey(Competency, on_delete=models.CASCADE)


class JobRole(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.TextField(unique=True)
    role_level = models.IntegerField(null=True)
    org_type = models.TextField()
    thin_desc = models.TextField(null=True)
    vertical = models.ForeignKey(Vertical, on_delete=models.CASCADE)
    specialism = models.ForeignKey(Specialism, null=True, 
                                   on_delete=models.CASCADE)


class JobRoleCompetency(models.Model):
    class Meta:
        unique_together = (("job_role", "competency"))
    job_role = models.ForeignKey(JobRole, on_delete=models.CASCADE)
    competency = models.ForeignKey(Competency, on_delete=models.CASCADE)


class CourseTechCompetency(models.Model):
    class Meta:
        unique_together = (("course", "tech_competency"))
    id = models.AutoField(primary_key=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    tech_competency = models.ForeignKey(TechCompetency,
                                        on_delete=models.CASCADE)


class CourseTechCompetencyCategory(models.Model):
    class Meta:
        unique_together = (("course", "tech_competency_category"))
    id = models.AutoField(primary_key=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    tech_competency_category = models.ForeignKey(TechCompetencyCategory,
            on_delete=models.CASCADE)
