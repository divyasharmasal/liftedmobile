import base64
import pytz
import os
import json
import datetime
import requests

from django.shortcuts import render
from django.contrib.admin.views.decorators import staff_member_required
from django.contrib.auth import authenticate, login
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponseServerError, HttpResponse
from django.shortcuts import redirect
from django.core.urlresolvers import reverse
from django.core.exceptions import PermissionDenied

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
def cms_get_unpublished_courses_data(request):
    result = {
        "courses": [],
        "levels": [c.name for c in app_models.Level.objects.all()],
        "formats": [c.name for c in app_models.Format.objects.all()]
    }

    # TODO: only show future courses??
    for scraped_course in models.ScrapedCourse.objects.filter(is_new=True):
        start_date = end_date = None

        if isinstance(scraped_course.start_date, datetime.datetime):
            start_date = scraped_course.start_date.isoformat()

        if isinstance(scraped_course.end_date, datetime.datetime):
            end_date = scraped_course.end_date.isoformat()

        result["courses"].append({
            "id": scraped_course.id,
            "name": scraped_course.name,
            "url": scraped_course.url,
            "cpd": {
                "points": scraped_course.public_cpd,
            },
            "start_date": start_date,
            "end_date": end_date,
            "spider_name": scraped_course.spider_name,
        })

    return json_response(result)


@staff_member_required(login_url=None)
def cms_get_published_courses_data(request):
    result = {
        "courses": [],
        "levels": [],
        "formats": [],
    }

    result["levels"] = [c.name for c in app_models.Level.objects.all()]
    result["formats"] = [c.name for c in app_models.Format.objects.all()]

    courses = app_models.Course.objects.all()
    courses = _optimise_course_query(courses)

    result["courses"] = [_course_json(course, include_id=True)
                         for course in courses]

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
    else:
        url = "cms/registration/login.html"
        return render(request, url, {"login_failed": True})


def _bytes_to_utf8(bytes_obj):
    """
    Converts @bytes_obj to a utf-8 string if it is and instance
    of the bytes type.
    """
    if isinstance(bytes_obj, bytes):
        return bytes_obj.decode("utf-8")
    return bytes_obj


@staff_member_required(login_url="login")
def save_course(request):
    body = json.loads(_bytes_to_utf8(request.body))

    # validate input
    spider_name = id = name = cost = url = level_name = cpd_points = \
        cpd_is_private = format_name = is_published = None

    is_new = "is_new" in body.keys() and body["is_new"]

    try:
        if not is_new:
            id = body["id"]
        name = body["name"]
        cost = body["cost"]
        url = body["url"]
        level_name = body["level"]
        cpd_points = body["cpdPoints"]
        cpd_is_private = body["cpdIsPrivate"]
        format_name = body["format"]
        is_published = body["is_published"]
        spider_name = body["spider_name"]
    except:
        import traceback
        traceback.print_exc()
        return HttpResponseServerError("Invalid body keys: {keys}"\
            .format(keys=str(body.keys())))

    if is_published and not is_new:
        # Course
        course = app_models.Course.objects.get(id=id)
        course.name = name
        course.url = url
        course.cost = cost
        course.save()

        # CPD

        course_cpd = app_models.CourseCpdPoints.objects.get(course=course)
        course_cpd.points = cpd_points
        course_cpd.is_private = cpd_is_private
        course_cpd.save()

        # Level

        level = app_models.Level.objects.get(name=level_name)
        course_level = app_models.CourseLevel.objects.get(course=course)
        course_level.level = level
        course_level.save()

        # Format

        format = app_models.Format.objects.get(name=format_name)
        course_format = app_models.CourseFormat.objects.get(course=course)
        course_format.format = format
        course_format.save()

        # Start date
        app_models.CourseStartDate.objects.filter(course=course).delete()

        timezone = pytz.timezone("Asia/Singapore")
        for date in body["start_dates"]:

            localized_date = timezone.localize(
                datetime.datetime.strptime(
                    date, "%d/%m/%Y"))

            course_start_date = app_models.CourseStartDate(
                course=course,
                start_date=localized_date)

            course_start_date.save()

        return json_response({
            "published_course_id": course.id,
        })
    else:
        id = None
        if not is_new:
            id = body["id"]
            scraped_course = models.ScrapedCourse(id=id)
            scraped_course.is_new = False
            scraped_course.save()

        # Course
        course = app_models.Course(name=name, url=url, cost=cost, spider_name=spider_name)
        course.save()

        # CPD

        # having private status & having public cpd points are mutually
        # exclusive
        if cpd_is_private:
            cpd_points = None

        if cpd_is_private is None or cpd_points is not None:
            cpd_is_private = False

        course_cpd = app_models.CourseCpdPoints(course=course,
                                                points=cpd_points,
                                                is_private=cpd_is_private)
        course_cpd.save()

        # Level
        level = app_models.Level.objects.get(name=level_name)
        course_level = app_models.CourseLevel(course=course, level=level)
        course_level.save()

        # Format
        format = app_models.Format.objects.get(name=format_name)
        course_format = app_models.CourseFormat(course=course, format=format)
        course_format.save()

        # Start dates
        course_start_dates = []
        timezone = pytz.timezone("Asia/Singapore")

        for date in list(set(body["start_dates"])):
            localized_date = timezone.localize(
                datetime.datetime.strptime(date, "%d/%m/%Y"))

            course_start_date = app_models.CourseStartDate(
                course=course, start_date=localized_date)
            course_start_dates.append(course_start_date)

        for c in course_start_dates:
            c.save()

        return json_response({
            "published_course_id": course.id,
        })


@staff_member_required(login_url="login")
def delete_course(request):
    body = json.loads(_bytes_to_utf8(request.body))

    id = body["id"]
    published = body["is_published"]

    if published:
        # TODO: recycle bin function
        app_models.Course.objects.get(id=id).delete()
    else:
        models.ScrapedCourse.objects.get(id=id).delete()

    return HttpResponse("Deleted course with id {id}".format(id=id))


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


@staff_member_required(login_url=None)
def scraper_run(request):
    body = json.loads(_bytes_to_utf8(request.body))
    spider_name = body["name"]
    payload = {"project": "scraper", "spider": spider_name}

    r = requests.post("http://scrapyd:6800/schedule.json", data=payload)
    response = json.loads(r.text)

    return json_response("ok")


@staff_member_required(login_url=None)
def scraper_list(request):
    r = requests.get("http://scrapyd:6800/listjobs.json?project=scraper")
    return json_response(r.json())


def is_from_scrapyd(function):
    def wrap(request, *args, **kwargs):
        # Security layer 1: all requests must be POST and all requests must
        # originate from the scrapyd container.

        if request.method != "POST":
            print("Unauthorised: invalid method")
            raise PermissionDenied()

        remote_addr = None
        if "DEV" in os.environ and os.environ["DEV"]:
            remote_addr = request.META["REMOTE_ADDR"]
        else:
            remote_addr = request.META["HTTP_X_REAL_IP"]

        if settings.SCRAPYD_IP != remote_addr:
            print("Unauthorised: invalid remote_addr {addr} vs {ip}"
                  .format(addr=remote_addr, ip=settings.SCRAPYD_IP))
            raise PermissionDenied()

        # Security layer 2: the API key must be correct
        scrapyd_api_key = None
        if "k" in request.POST:
            scrapyd_api_key = request.POST["k"]
        else:
            print("Unauthorised: no API key")
            raise PermissionDenied()

        if scrapyd_api_key != settings.SCRAPYD_API_KEY:
            print("Unauthorised: invalid API key")
            raise PermissionDenied()

        return function(request, *args, **kwargs)

    wrap.__doc__ = function.__doc__
    wrap.__name__ = function.__name__
    return wrap


@csrf_exempt
@is_from_scrapyd
def scraper_sync_urls(request):
    post_keys = request.POST.keys()
    if "spider" not in post_keys or "urls" not in post_keys:
        return HttpResponseServerError("Invalid params.")

    spider_name = request.POST["spider"]
    urls =json.loads(request.POST["urls"])

    # Delete scraped courses that aren't in the URL list
    (models.ScrapedCourse.objects
     .filter(spider_name=spider_name)
     .exclude(url__in=urls)
     .delete())

    return json_response("ok")


@csrf_exempt
@is_from_scrapyd
def scraper_add_course(request):
    """
    Endpoint for scrapers to add a course to the CMS.
    """
    
    # Parse course data
    course_data = None
    spider_name = None

    try:
        course_data = json.loads(request.POST["c"])
    except:
        return HttpResponseServerError("Invalid or missing course data")

    try:
        spider_name = request.POST["spider_name"]
    except:
        return HttpResponseServerError("Invalid or missing spider name")

    # Validate course_data here
    if len(course_data.keys()) == 0:
        return HttpResponseServerError("Empty course data JSON")

    # Do nothing if a ScrapedCourse with the same data exists:
    if models.ScrapedCourse.objects \
        .filter(name=course_data["name"],
                url=course_data["url"],
                public_cpd=course_data["public_cpd"],
                spider_name=spider_name,
                start_date=course_data["start_date"],
                end_date=course_data["end_date"]).exists():

        print("Found a matching ScrapedCourse")
        return json_response("Found matching ScrapedCourse")

    # Do nothing if an app_models.Course with the same data exists.
    if app_models.Course.objects\
        .filter(name=course_data["name"],
                url=course_data["url"],
                coursestartdate__start_date=course_data["start_date"]).exists():

        print("Found a matching Course")
        return json_response("Found matching Course")

    # TODO: update published matching courses with the same URL


    # Otherwise, update/create the ScrapedCourse:
    scraped_course, created = models.ScrapedCourse.objects.update_or_create(
        defaults={"start_date": course_data["start_date"],
                  "end_date": course_data["end_date"],
                  "public_cpd": course_data["public_cpd"],
                  "name": course_data["name"],
              },
        spider_name=spider_name,
        url=course_data["url"],
        is_new=True)

    if created:
        return json_response("Added ScrapedCourse")
    else:
        return json_response("Updated ScrapedCourse")

    return json_response("No action taken")
