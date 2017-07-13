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


class Vertical(models.Model):
    id = models.IntegerField(primary_key=True)
    name = models.TextField(unique=True)
    question= models.TextField(unique=True)


class VerticalCategory(models.Model):
    # the ID is the category key (1, 2, 3, etc)
    id = models.IntegerField(primary_key=True)

    vertical = models.ForeignKey(Vertical, on_delete=models.CASCADE)
    # e.g. Technical Lawyering
    name = models.TextField()

    # the copy-text of the question that the user sees
    # e.g. Administration and problem-solving
    question = models.TextField()


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
    question = models.TextField(unique=True)
    format = models.ForeignKey(Format, on_delete=models.CASCADE)
    level = models.ForeignKey(Level, on_delete=models.CASCADE)
