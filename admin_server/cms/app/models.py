from django.db import models

# Create your models here.


class Course(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.TextField()
    cost = models.DecimalField(decimal_places=2, max_digits=11)
    duration = models.DecimalField(decimal_places=1, max_digits=6)
    url = models.TextField(null=True)
