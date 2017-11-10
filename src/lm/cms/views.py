import base64
import os
import json

from django.shortcuts import render
from django.contrib.admin.views.decorators import staff_member_required
from django.contrib.auth import authenticate, login
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponseServerError, HttpResponse
from django.shortcuts import redirect
from django.core.urlresolvers import reverse

from lm import settings
from app.views import _optimise_course_query, _course_json
from cms import models
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

    result["levels"] = [c.name for c in app_models.Level.objects.all()]
    result["formats"] = [c.name for c in app_models.Format.objects.all()]

    courses = app_models.Course.objects.all()
    courses = _optimise_course_query(courses)

    result["courses"] = [_course_json(course) for course in courses]

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
        return redirect(next_url)
        # return redirect(reverse(next_url))
    else:
        return _render_login_failed(request)


def _render_login_failed(request):
    url = "registration/login.html"
    return render(request, url, {"login_failed": True})


@staff_member_required(login_url="login")
def index(request):
    """
    View for /
    """

    url = "cms/base.html"
    return render(request, url, {"cache_bust": gen_cache_bust_str(10)})


@csrf_exempt
def scraper_sal_add_course(request):
    """
    Endpoint for scrapers to add a course to the CMS.
    """

    # Security layer 1: all requests must be POST and all requests must
    # originate from the scrapyd container.

    if request.method != "POST" or \
            settings.SCRAPYD_IP != request.META["REMOTE_ADDR"]:
        return HttpResponseServerError("Unauthorised")

    # Security layer 2: the API key must be correct
    scrapyd_api_key = None

    if "k" in request.POST:
        scrapyd_api_key = request.POST["k"]
    else:
        print("no key")
        return HttpResponseServerError("Unauthorised")

    if scrapyd_api_key != settings.SCRAPYD_API_KEY:
        print("invalid key")
        return HttpResponseServerError("Unauthorised")
    
    # Parse course data

    course_data = None
    try:
        course_data = json.loads(request.POST["c"])
    except:
        print("no course data")
        return HttpResponseServerError("Invalid course data")

    # Validate course_data here
    if len(course_data.keys()) == 0:
        return HttpResponseServerError("Empty course data JSON")

    try:
        # Do nothing if a course with the same data exists
        models.ScrapedSalCourse.objects.get(
            name=course_data["name"],
            url=course_data["url"],
            start_date=course_data["start_date"],
            end_date=course_data["end_date"])

        print("Exact match found; skipping")

    except models.ScrapedSalCourse.DoesNotExist:
        # Otherwise, update/create the row:
        models.ScrapedSalCourse.objects.update_or_create(
            defaults={"start_date": course_data["start_date"],
                      "end_date": course_data["end_date"]},
            name=course_data["name"],
            url=course_data["url"],
            is_new=True)

    return json_response("OK")
