from django.db import models


class Vertical(models.Model):
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


class Course(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.TextField()
    cost = models.DecimalField(decimal_places=2, max_digits=11)
    duration = models.DecimalField(decimal_places=1, max_digits=6)


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
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    format = models.ForeignKey(Format, on_delete=models.CASCADE)


class CourseLevel(models.Model):
    class Meta:
        unique_together = (("course", "level"))
    id = models.AutoField(primary_key=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    level = models.ForeignKey(Level, on_delete=models.CASCADE)


class CourseVenue(models.Model):
    class Meta:
        unique_together = (("course", "venue"))
    id = models.AutoField(primary_key=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    venue = models.ForeignKey(Venue, on_delete=models.CASCADE)


class CourseStartDate(models.Model):
    class Meta:
        unique_together = (("course", "start_date"))
    id = models.AutoField(primary_key=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    start_date = models.TextField()


class Funding(models.Model):
    funding_type = models.TextField(primary_key=True)


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
