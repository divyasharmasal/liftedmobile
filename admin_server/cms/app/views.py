import base64
import os

from django.shortcuts import render
from django.contrib.admin.views.decorators import staff_member_required
from django.contrib.auth import authenticate, login
from django.http import HttpResponseServerError, HttpResponse
from django.shortcuts import redirect
from django.core.urlresolvers import reverse
# from app.views import _optimise_course_query, _course_json
from app import models as app_models


def gen_cache_bust_str(length=32):
    """
    Returns a URL-friendly, 32-bit random string
    """
    return (base64.urlsafe_b64encode(os.urandom(length))
            .rstrip(b'=').decode('ascii'))


def json_response(obj):
    """
    Returns @obj in JSON format, wrapped in a HttpResponse
    """
    return HttpResponse(json.dumps(obj, separators=(',', ':')),
                        content_type="application/json")


@staff_member_required(login_url=None)
def cms_get_coursespage_data(request):
    result = {
        "courses": [],
        "levels": [],
        "formats": [],
    }

    # result["levels"] = [c.name for c in app_models.Level.objects.all()]
    # result["formats"] = [c.name for c in app_models.Format.objects.all()]

    # courses = app_models.Course.objects.all()
    # courses = _optimise_course_query(courses)

    # result["courses"] = [_course_json(course) for course in courses]

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
    print("============================")
    print(request)
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
    url = "./templates/registration/login.html"
    return render(request, url, {"login_failed": True})


@staff_member_required(login_url=None)
def index(request):
    """
    View for /
    """

    url = "cms/base.html"
    return render(request, url, {"cache_bust": gen_cache_bust_str(10)})
