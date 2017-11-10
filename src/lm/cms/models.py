from django.db import models


class ScrapedSalCourse(models.Model):
    id = models.AutoField(primary_key=True)

    is_new = models.BooleanField(null=False)

    name = models.TextField(null=False)
    url = models.TextField(null=False)

    start_date = models.DateTimeField(null=True)
    end_date = models.DateTimeField(null=True)
