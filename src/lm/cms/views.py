from django.shortcuts import render
from django.contrib.admin.views.decorators import staff_member_required
# from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login
from django.http import HttpResponseServerError
from django.shortcuts import redirect
from django.core.urlresolvers import reverse
from app.views import gen_cache_bust_str, json_response
from app import models as app_models


@staff_member_required(login_url=None)
def cms_get_courses(request):
    result = []
    courses = app_models.Course.objects.all()

    for course in courses:
        course_level = app_models.CourseLevel.objects.get(course=course)
        level = app_models.Level.objects.get(acronym=course_level.level_id)
        start_dates = app_models.CourseStartDate.objects.filter(course=course)
        course_format = app_models.CourseFormat.objects.get(course=course)
        format_name = app_models.Format.objects.get(
                acronym=course_format.format_id).name
        points = app_models.CourseCpdPoints.objects.get(course=course)
        cpd_points = points.points
        if cpd_points is None:
            cpd_points = 0

        result.append({
            "name": course.name,
            "cost": float(course.cost),
            "url": course.url,
            "start_dates": [x.start_date for x in start_dates],
            "level": level.name,
            "format": format_name,
            "cpd": {
                "points": float(cpd_points),
                "is_private": points.is_private
                }
        })
    return json_response(result)


@staff_member_required(login_url=None)
def cms_account_name(request):
    user = request.user
    if user.is_staff:
        return json_response({
            "username": user.username
        })
    else:
        return HttpResponseServerError("Invalid user.")


def cms_login(request):
    username = request.POST["username"]
    password = request.POST["password"]
    next_url = request.POST["next"]

    user = authenticate(username=username, password=password)
    if user is not None and user.is_staff:
        login(request, user)
        return redirect(reverse(next_url))
    else:
        return _render_login_failed(request)


def _render_login_failed(request):
    return render(request,
                  "../../cms/templates/registration/login.html",
                  {"login_failed": True}
                  )


@staff_member_required(login_url=None)
def index(request):
    """
    View for /
    """

    return render(request, "cms/base.html",
                  {"cache_bust": gen_cache_bust_str(10)})
