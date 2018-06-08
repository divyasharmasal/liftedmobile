# from django.contrib import admin
# from django import forms

# from app import models

# class CourseStartDateForm(forms.ModelForm):
    # class Meta:
        # model = models.CourseDate
        # fields = ("start_date",)
        # widgets = {
            # "start_date": forms.Textarea(attrs={"rows": 1}),
        # }


# class CourseStartDateInlineAdmin(admin.TabularInline):
    # model = models.CourseStartDate
    # form = CourseStartDateForm
    # max_num = 2


# class CourseModelForm(forms.ModelForm):
    # class Meta:
        # model = models.Course
        # widgets = {
            # "name": forms.Textarea(attrs={"rows": 1}),
            # "url": forms.Textarea(attrs={"rows": 1, "cols":120}),
        # }

        # fields = ("name", "cost", "url", )



# class CourseAdmin(admin.ModelAdmin):
    # form = CourseModelForm
    # list_display = ("id", "name")
    # list_display_links = list_display
    # inlines = [ CourseStartDateInlineAdmin ]


# admin.site.register(models.Course, CourseAdmin)
# admin.site.register(models.CourseStartDate)
