# -*- coding: utf-8 -*-
# Generated by Django 1.11.5 on 2017-10-03 02:46
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Competency',
            fields=[
                ('id', models.IntegerField(primary_key=True, serialize=False)),
                ('copy_title', models.TextField()),
                ('full_desc', models.TextField(null=True)),
            ],
        ),
        migrations.CreateModel(
            name='CompetencyCategory',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('name', models.TextField()),
            ],
        ),
        migrations.CreateModel(
            name='Course',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('name', models.TextField()),
                ('cost', models.DecimalField(decimal_places=2, max_digits=11, null=True)),
                ('duration', models.DecimalField(decimal_places=1, max_digits=6, null=True)),
                ('url', models.TextField(null=True)),
                ('spider_name', models.TextField(null=True)),
                ('provider', models.TextField(null=True)),
                ('is_manually_added', models.NullBooleanField()),
                ('cost_is_varying', models.NullBooleanField()),
            ],
        ),
        migrations.CreateModel(
            name='CourseCompetency',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('competency', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='app.Competency')),
                ('course', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='app.Course')),
            ],
        ),
        migrations.CreateModel(
            name='CourseCpdPoints',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('points', models.DecimalField(decimal_places=2, max_digits=6, null=True)),
                ('is_private', models.BooleanField()),
                ('is_tbc', models.BooleanField()),
                ('course', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='app.Course')),
            ],
        ),
        migrations.CreateModel(
            name='CourseFormat',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('course', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='app.Course')),
            ],
        ),
        migrations.CreateModel(
            name='CourseFunding',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('course', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='app.Course')),
            ],
        ),
        migrations.CreateModel(
            name='CourseLevel',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('course', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='app.Course')),
            ],
        ),
        migrations.CreateModel(
            name='CourseStartDate',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('start_date', models.DateTimeField(null=True)),
                ('course', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='app.Course')),
            ],
        ),
        migrations.CreateModel(
            name='CourseTechCompetency',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('course', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='app.Course')),
            ],
        ),
        migrations.CreateModel(
            name='CourseTechCompetencyCategory',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('course', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='app.Course')),
            ],
        ),
        migrations.CreateModel(
            name='CourseVenue',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('course', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='app.Course')),
            ],
        ),
        migrations.CreateModel(
            name='CourseVerticalCategory',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('course', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='app.Course')),
            ],
        ),
        migrations.CreateModel(
            name='Format',
            fields=[
                ('acronym', models.TextField(primary_key=True, serialize=False)),
                ('name', models.TextField(unique=True)),
            ],
        ),
        migrations.CreateModel(
            name='Funding',
            fields=[
                ('funding_type', models.TextField(primary_key=True, serialize=False)),
            ],
        ),
        migrations.CreateModel(
            name='JobRole',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('name', models.TextField(unique=True)),
                ('role_level', models.IntegerField(null=True)),
                ('org_type', models.TextField()),
                ('thin_desc', models.TextField(null=True)),
            ],
        ),
        migrations.CreateModel(
            name='JobRoleCompetency',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('competency', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='app.Competency')),
                ('job_role', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='app.JobRole')),
            ],
        ),
        migrations.CreateModel(
            name='Level',
            fields=[
                ('acronym', models.TextField(primary_key=True, serialize=False)),
                ('name', models.TextField(unique=True)),
            ],
        ),
        migrations.CreateModel(
            name='Need',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('name', models.TextField(unique=True)),
                ('option', models.TextField(unique=True)),
            ],
        ),
        migrations.CreateModel(
            name='NeedFormat',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('format', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='app.Format')),
                ('need', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='app.Need')),
            ],
        ),
        migrations.CreateModel(
            name='NeedLevel',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('level', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='app.Level')),
                ('need', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='app.Need')),
            ],
        ),
        migrations.CreateModel(
            name='Specialism',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('name', models.TextField(unique=True)),
            ],
        ),
        migrations.CreateModel(
            name='TechCompetency',
            fields=[
                ('id', models.IntegerField(primary_key=True, serialize=False)),
                ('copy_title', models.TextField()),
                ('full_desc', models.TextField()),
            ],
        ),
        migrations.CreateModel(
            name='TechCompetencyCategory',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('name', models.TextField()),
            ],
        ),
        migrations.CreateModel(
            name='TechRole',
            fields=[
                ('id', models.IntegerField(primary_key=True, serialize=False)),
                ('name', models.TextField(unique=True)),
                ('role_level', models.IntegerField(null=True)),
                ('option', models.TextField(unique=True)),
            ],
        ),
        migrations.CreateModel(
            name='TechRoleCompetency',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('tech_competency', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='app.TechCompetency')),
                ('tech_role', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='app.TechRole')),
            ],
        ),
        migrations.CreateModel(
            name='Venue',
            fields=[
                ('acronym', models.TextField(primary_key=True, serialize=False)),
                ('name', models.TextField(unique=True)),
            ],
        ),
        migrations.CreateModel(
            name='Vertical',
            fields=[
                ('id', models.IntegerField(primary_key=True, serialize=False)),
                ('name', models.TextField(unique=True)),
                ('option', models.TextField(unique=True)),
            ],
        ),
        migrations.CreateModel(
            name='VerticalCategory',
            fields=[
                ('id', models.IntegerField(primary_key=True, serialize=False)),
                ('key', models.IntegerField()),
                ('name', models.TextField()),
                ('option', models.TextField()),
                ('vertical', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='app.Vertical')),
            ],
        ),
        migrations.AddField(
            model_name='techcompetencycategory',
            name='tech_role',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='app.TechRole'),
        ),
        migrations.AddField(
            model_name='techcompetency',
            name='category',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='app.TechCompetencyCategory'),
        ),
        migrations.AddField(
            model_name='jobrole',
            name='specialism',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='app.Specialism'),
        ),
        migrations.AddField(
            model_name='jobrole',
            name='vertical',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='app.Vertical'),
        ),
        migrations.AddField(
            model_name='courseverticalcategory',
            name='vertical_category',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='app.VerticalCategory'),
        ),
        migrations.AddField(
            model_name='coursevenue',
            name='venue',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='app.Venue'),
        ),
        migrations.AddField(
            model_name='coursetechcompetencycategory',
            name='tech_competency_category',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='app.TechCompetencyCategory'),
        ),
        migrations.AddField(
            model_name='coursetechcompetency',
            name='tech_competency',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='app.TechCompetency'),
        ),
        migrations.AddField(
            model_name='courselevel',
            name='level',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='app.Level'),
        ),
        migrations.AddField(
            model_name='coursefunding',
            name='funding_type',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='app.Funding'),
        ),
        migrations.AddField(
            model_name='courseformat',
            name='format',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='app.Format'),
        ),
        migrations.AddField(
            model_name='competencycategory',
            name='vertical',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='app.Vertical'),
        ),
        migrations.AddField(
            model_name='competency',
            name='category',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='app.CompetencyCategory'),
        ),
        migrations.AddField(
            model_name='competency',
            name='specialism',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='app.Specialism'),
        ),
        migrations.AddField(
            model_name='competency',
            name='vertical',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='app.Vertical'),
        ),
        migrations.AlterUniqueTogether(
            name='verticalcategory',
            unique_together=set([('key', 'vertical')]),
        ),
        migrations.AlterUniqueTogether(
            name='techrolecompetency',
            unique_together=set([('tech_role', 'tech_competency')]),
        ),
        migrations.AlterUniqueTogether(
            name='needlevel',
            unique_together=set([('need', 'level')]),
        ),
        migrations.AlterUniqueTogether(
            name='needformat',
            unique_together=set([('need', 'format')]),
        ),
        migrations.AlterUniqueTogether(
            name='jobrolecompetency',
            unique_together=set([('job_role', 'competency')]),
        ),
        migrations.AlterUniqueTogether(
            name='courseverticalcategory',
            unique_together=set([('course', 'vertical_category')]),
        ),
        migrations.AlterUniqueTogether(
            name='coursevenue',
            unique_together=set([('course', 'venue')]),
        ),
        migrations.AlterUniqueTogether(
            name='coursetechcompetencycategory',
            unique_together=set([('course', 'tech_competency_category')]),
        ),
        migrations.AlterUniqueTogether(
            name='coursetechcompetency',
            unique_together=set([('course', 'tech_competency')]),
        ),
        migrations.AlterUniqueTogether(
            name='coursestartdate',
            unique_together=set([('course', 'start_date')]),
        ),
        migrations.AlterUniqueTogether(
            name='courselevel',
            unique_together=set([('course', 'level')]),
        ),
        migrations.AlterUniqueTogether(
            name='coursefunding',
            unique_together=set([('course', 'funding_type')]),
        ),
        migrations.AlterUniqueTogether(
            name='courseformat',
            unique_together=set([('course', 'format')]),
        ),
        migrations.AlterUniqueTogether(
            name='coursecompetency',
            unique_together=set([('course', 'competency')]),
        ),
        migrations.AlterUniqueTogether(
            name='competencycategory',
            unique_together=set([('vertical', 'name')]),
        ),
    ]
