from django.db import models

from app import models as app_models

class LiftedKey(models.Model):
    id = models.AutoField(primary_key=True)
    vertical_name = models.TextField(null=False)
    vertical_category_name = models.TextField(null=False)


class ScrapedCourse(models.Model):
    id = models.AutoField(primary_key=True)
    is_new = models.BooleanField(null=False)
    name = models.TextField(null=False)
    url = models.TextField(null=False)
    start_date = models.DateTimeField(null=True)
    end_date = models.DateTimeField(null=True)
    public_cpd = models.FloatField(null=True)
    spider_name = models.TextField(null=False)
    lifted_keys = models.ManyToManyField(LiftedKey)
    provider = models.TextField(null=True)
    level = models.TextField(null=True)
