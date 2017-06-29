from django.db import models

class Question(models.Model):
    id = models.AutoField(primary_key=True)
    index = models.IntegerField(unique=True)
    text = models.TextField()


class Option(models.Model):
    id = models.AutoField(primary_key=True)
    index = models.IntegerField()
    text = models.TextField()
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
