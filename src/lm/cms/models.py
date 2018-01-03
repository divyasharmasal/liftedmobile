from django.db import models

from app import models as app_models

class LiftedKey(models.Model):
    id = models.AutoField(primary_key=True)
    vertical_name = models.TextField(null=False)
    vertical_category_name = models.TextField(null=False)


class LiftedTechKey(models.Model):
    id = models.AutoField(primary_key=True)
    category_name = models.TextField(null=False)


class ScrapedCourse(models.Model):
    id = models.AutoField(primary_key=True)
    is_new = models.BooleanField(null=False)
    name = models.TextField(null=False)
    url = models.TextField(null=False)
    public_cpd = models.FloatField(null=True)
    spider_name = models.TextField(null=False)
    lifted_keys = models.ManyToManyField(LiftedKey)
    lifted_tech_keys = models.ManyToManyField(LiftedTechKey)
    provider = models.TextField(null=True)
    level = models.TextField(null=True)


class ScrapedCourseDate(models.Model):
    id = models.AutoField(primary_key=True)
    scraped_course = models.ForeignKey(ScrapedCourse, on_delete=models.CASCADE)
    start_date = models.DateTimeField(null=False)
    end_date = models.DateTimeField(null=True)
