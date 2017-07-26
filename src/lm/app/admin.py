from django.contrib import admin
from app import models


# Register your models here.
# models_to_reg = [models.Course, models.CourseCpdPoints, models.CourseFormat,
        # models.CourseFunding, models.CourseStartDate, models.CourseVenue,
        # models.Vertical, models.VerticalCategory, models.CourseVerticalCategory,
        # models.CourseLevel, models.Need, models.NeedFormat, models.NeedLevel,
        # models.Venue]

# for m in models_to_reg:
    # admin.site.register(m)

class CourseAdmin(admin.ModelAdmin):
    list_display = ("id", "name",)
    fields = ("name",)

admin.site.register(models.Course, CourseAdmin)
