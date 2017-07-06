# -*- coding: utf-8 -*-
# Generated by Django 1.11.2 on 2017-06-29 08:27
from __future__ import unicode_literals

from django.db import migrations


def load_mvp_data(apps, schema_editor):
    # Load the models
    Question = apps.get_model("app", "Question")
    Option = apps.get_model("app", "Option")

    # Data for question 0
    qn_0 = Question(index=0, text="What is your job?")
    qn_0.save()

    # Option data for question 0
    opt_0_0 = Option(text="I am a practicing lawyer.", 
            index=0, question=qn_0)
    opt_0_0.save()

    opt_0_1 = Option(text="I provide legal support services.",
            index=1, question=qn_0)
    opt_0_1.save()

    opt_0_2 = Option(text="I am an in-house counsel.",
            index=2, question=qn_0)
    opt_0_2.save()


    # Data for question 1
    qn_1 = Question(index=1, text="What do you want to learn?")
    qn_1.save()

    opt_1_0 = Option(text="Operations", 
            index=0, question=qn_1)
    opt_1_0.save()

    opt_1_1 = Option(text="IT skills", 
            index=1, question=qn_1)
    opt_1_1.save()

    opt_1_2 = Option(text="Administration and problem-solving", 
            index=2, question=qn_1)
    opt_1_2.save()

    opt_1_3 = Option(text="Communication and teamwork", 
            index=3, question=qn_1) 
    opt_1_3.save()

    opt_1_4 = Option(text="Professionalism and service", 
            index=4, question=qn_1) 
    opt_1_4.save()

    opt_1_5 = Option(text="Specialisations", 
            index=5, question=qn_1) 
    opt_1_5.save()

    opt_1_6 = Option(text="Something else", 
            index=6, question=qn_1) 
    opt_1_6.save()


    # Data for question 2
    qn_2 = Question(index=2, text="Why do you want to learn?")
    qn_2.save()

    opt_2_0 = Option(text="I want to learn different perspectives on the law.", 
            index=0, question=qn_2)
    opt_2_0.save()


    opt_2_1 = Option(text="I want to acquire foundational skills.",
            index=1, question=qn_2)
    opt_2_1.save()


    opt_2_2 = Option(text="I want to acquire higher-level skills.",
            index=2, question=qn_2)
    opt_2_2.save()


    opt_2_3 = Option(text="I want to have a basic understanding about various subjects.",
            index=3, question=qn_2)
    opt_2_3.save()


    opt_2_4 = Option(text="I want to deepen my understanding about various subjects.",
            index=4, question=qn_2)
    opt_2_4.save()

    opt_2_5 = Option(text="I want to update myself on my specific area of work.",
            index=5, question=qn_2)
    opt_2_5.save()


    # Data for question 3
    qn_3 = Question(index=3, text="What do you hope to achieve?")
    qn_3.save()

    opt_3_0 = Option(text="Prepare for my next job role.",
            index=0, question=qn_3)
    opt_3_0.save()

    opt_3_1 = Option(text="Get better at my current job.",
            index=1, question=qn_3)
    opt_3_1.save()


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(load_mvp_data)
    ]
