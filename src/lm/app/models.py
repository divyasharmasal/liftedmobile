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


class JobVertical(models.Model):
    id = models.IntegerField(primary_key=True)
    title = models.TextField()

    # the copy-text of the question that the user sees
    question_text = models.TextField()


class LCategory(models.Model):
    # the ID is the category key (1, 2, 3, etc)
    id = models.IntegerField(primary_key=True) 

    # e.g. Technical Lawyering
    title = models.TextField()

    # the copy-text of the question that the user sees
    # e.g. Administration and problem-solving
    question_text = models.TextField()
