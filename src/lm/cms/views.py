"""
Views for the CMS
"""

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


def json_response(obj):
    """
    Returns @obj in JSON format, wrapped in a HttpResponse
    """
    return HttpResponse(
        json.dumps(obj, separators=(',', ':')),
        content_type="application/json")


def get_level_format_vertical_data():
    """
    Returns data about levels, formats, and verticals
    """

    result = {
        "levels": [c.name for c in app_models.Level.objects.all()],
        "formats": [c.name for c in app_models.Format.objects.all()],
        "verticals": {}
    }
    vertical_category_query = (
        app_models.VerticalCategory.objects.all()
        .select_related("vertical")
    )

    for vertical_category in vertical_category_query:
        vertical_name = vertical_category.vertical.name
        vertical_category_name = vertical_category.name
        if vertical_name not in result["verticals"]:
            result["verticals"][vertical_name] = [vertical_category_name]
        else:
            result["verticals"][vertical_name].append(vertical_category_name)

    
    tech_verticals = []
    tech_competency_category_query = (
        app_models.TechCompetencyCategory.objects.all()
        .distinct("name")
    )

    for tech_comp_cat in tech_competency_category_query:
        tech_verticals.append(tech_comp_cat.name)

    result["verticals"]["Technology Framework"] = tech_verticals

    return result


@staff_member_required(login_url=None)
def cms_get_unpublished_courses_data(request):
    """
    For /cms/get_unpublished_courses_data/
    """
    result = get_level_format_vertical_data()
    result["courses"] = []

    # TODO: only show future courses??

    sc_query = (
        models.ScrapedCourse.objects
        .filter(is_new=True)
        .prefetch_related("lifted_keys")
    )


    for scraped_course in sc_query:
        lifted_keys = []
        for lifted_key in scraped_course.lifted_keys.all():
            lifted_keys.append({
                "vertical_name": lifted_key.vertical_name,
                "vertical_category_name": lifted_key.vertical_category_name,
            })


        start_date = end_date = None

        if isinstance(scraped_course.start_date, datetime.datetime):
            start_date = scraped_course.start_date.isoformat()

        if isinstance(scraped_course.end_date, datetime.datetime):
            end_date = scraped_course.end_date.isoformat()

        result["courses"].append({
            "id": scraped_course.id,
            "name": scraped_course.name,
            "provider": scraped_course.provider,
            "url": scraped_course.url,
            "cpd": {
                "points": scraped_course.public_cpd,
            },
            "start_date": start_date,
            "end_date": end_date,
            "spider_name": scraped_course.spider_name,
            "lifted_keys": lifted_keys,
            "level": scraped_course.level,
            "cost": {
                "cost_is_varying": False,
                "value": None
            }
        })

    return json_response(result)


@staff_member_required(login_url=None)
def cms_get_published_courses_data(request):
    result = get_level_format_vertical_data()

    courses = app_models.Course.objects.all()
    courses = _optimise_course_query(courses)

    result["courses"] = [_course_json(
                            course,
                            include_id=True,
                            include_lifted_keys=True)
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
        cpd_is_private = format_name = lifted_keys = is_published = \
        provider = None

    is_new = "is_new" in body.keys() and body["is_new"]

    if "cpdIsTbc" not in body:
        body["cpdIsTbc"] = False
    try:
        if not is_new:
            id = body["id"]
        name = body["name"]
        cost = body["cost"]
        url = body["url"]
        level_name = body["level"]
        cpd_points = body["cpdPoints"]
        cpd_is_private = body["cpdIsPrivate"]
        cpd_is_tbc = body["cpdIsTbc"]
        format_name = body["format"]
        is_published = body["is_published"]
        spider_name = body["spider_name"]
        lifted_keys = body["lifted_keys"]
        is_manually_added = body["is_manually_added"]
        provider = body["provider"]
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
        course.cost = cost["cost"]
        course.cost_is_varying = cost["isVarying"]
        course.provider = provider
        course.save()

        # LIFTED keys
        app_models.CourseVerticalCategory.objects.filter(course=course).delete()
        app_models.CourseTechCompetencyCategory.objects.filter(course=course).delete()
        for lifted_key in lifted_keys:
            if lifted_key["vertical_name"] == "Technology Framework":
                tech_comp_cat_name = lifted_key["vertical_category_name"]

                for tech_comp_cat in (app_models.TechCompetencyCategory.objects
                                      .filter(name=tech_comp_cat_name)):

                    course_tech_comp_cat = app_models.CourseTechCompetencyCategory(
                        course=course,
                        tech_competency_category=tech_comp_cat
                    )
                    course_tech_comp_cat.save()
            else:
                vc = app_models.VerticalCategory.objects.get(
                    name=lifted_key["vertical_category_name"],
                    vertical__name=lifted_key["vertical_name"]
                    )

                cvc = app_models.CourseVerticalCategory(
                    course=course,
                    vertical_category=vc
                )
                cvc.save()

        # CPD
        course_cpd = app_models.CourseCpdPoints.objects.get(course=course)
        course_cpd.points = cpd_points
        course_cpd.is_private = cpd_is_private
        course_cpd.is_tbc = cpd_is_tbc
        if cpd_is_tbc:
            course_cpd.points = None
            course_cpd.is_private = False
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
        app_models.CourseDate.objects.filter(course=course).delete()

        timezone = pytz.timezone("Asia/Singapore")
        for date in body["start_dates"]:

            localized_date = timezone.localize(
                datetime.datetime.strptime(
                    date, "%d/%m/%Y"))

            course_start_date = app_models.CourseDate(
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
        course = app_models.Course(name=name,
                                   url=url,
                                   cost=cost["cost"],
                                   cost_is_varying=cost["isVarying"],
                                   spider_name=spider_name,
                                   provider=provider,
                                   is_manually_added=is_manually_added)
        course.save()

        # LIFTED keys
        for lifted_key in lifted_keys:
            if lifted_key["vertical_name"] == "Technology Framework":
                for tech_comp_cat in app_models.TechCompetencyCategory.objects.filter(
                    name=lifted_key["vertical_category_name"]):
                    course_tcc = app_models.CourseTechCompetencyCategory(
                        course=course,
                        tech_competency_category=tech_comp_cat)
                    course_tcc.save()

            else:
                vertical_category = app_models.VerticalCategory.objects.get(
                    name=lifted_key["vertical_category_name"],
                    vertical__name=lifted_key["vertical_name"]
                )

                course_vc = app_models.CourseVerticalCategory(
                    course=course, 
                    vertical_category=vertical_category)
                course_vc.save()

        # CPD

        # having private status & having public cpd points are mutually
        # exclusive
        if cpd_is_private:
            cpd_points = None

        if cpd_is_private is None or cpd_points is not None:
            cpd_is_private = False

        course_cpd = app_models.CourseCpdPoints(course=course,
                                                points=cpd_points,
                                                is_tbc=cpd_is_tbc,
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

            course_start_date = app_models.CourseDate(
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
    return render(request, "cms/base.html")


@staff_member_required(login_url=None)
def scraper_run(request):
    body = json.loads(_bytes_to_utf8(request.body))
    spider_name = body["name"]
    payload = {"project": "scraper", "spider": spider_name}

    url = "http://" + settings.SCRAPYD_IP + ":6800/schedule.json"
    r = requests.post(url, data=payload)
    response = json.loads(r.text)

    return json_response("ok")


@staff_member_required(login_url=None)
def scraper_list(request):
    url = "http://" + settings.SCRAPYD_IP + ":6800/listjobs.json?project=scraper"
    r = requests.get(url)
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


def create_course_dates(date_ranges):
    for dr in date_ranges:
        csd = app_models.CourseDate(
            course=course,
            start_date=dr.start_date,
            end_date=dr.start_date)
        csd.save()

@csrf_exempt
@is_from_scrapyd
def scraper_add_course(request):
    """
    Endpoint for scrapers to add a course to the CMS.
    """
    
    # Parse course data
    course_data = None
    spider_name = None

    # Load POST param data
    try:
        course_data = json.loads(request.POST["c"])
    except:
        return HttpResponseServerError("Invalid or missing course data")

    # Validate course_data
    if len(course_data.keys()) == 0:
        return HttpResponseServerError("Empty course data JSON")

    try:
        spider_name = request.POST["spider_name"]
    except:
        return HttpResponseServerError("Invalid or missing spider name")

    name = url = public_cpd = date_ranges = provider = level = None
    try:
        name = course_data["name"]
        url = course_data["url"]
        public_cpd = course_data["public_cpd"]
        date_ranges = course_data["date_ranges"]
        provider = course_data["provider"]
        level = course_data["level"]

        if level == "Foundation":
            level = "Foundational"
    except:
        return HttpResponseServerError("Invalid course data params")

    # Do nothing if a ScrapedCourse with the same data exists:
    sc_exists = (models.ScrapedCourse.objects.filter(
                    name=name,
                    url=url,
                    spider_name=spider_name,
                    public_cpd=public_cpd,
                    end_date=end_date,
                    level=level,
                    provider=provider).exists())

    sc = (models.ScrapedCourse.objects
          .get(name=name,
               url=url,
               spider_name=spider_name,
               public_cpd=public_cpd,
               end_date=end_date,
               level=level,
               provider=provider).exists())

    # Check whether the date ranges match
    sc_date_ranges = models.ScrapedCourseDate.objects\
        .filter(scraped_course=sc)

    # Compare the no. of date ranges
    sc_date_range_matches = len(sc_date_ranges) != len(date_ranges)

    # Make sure the date ranges actually match
    for sc_dr in sc_date_ranges:
        found = False
        for date_range in date_ranges:
            start = date_range["start"]
            end = date_range["end"]
            if sc_dr.start == start and sc_dr.end == end:
                found = True
                break
        sc_date_range_matches = sc_date_range_matches and found

    # Exit if the ScrapedCourse exists
    if sc_exists and sc_date_range_exists:
        return json_response("Found matching ScrapedCourse, skipping.")

    # Update published matching courses with the same spider name and url:
    # Note: the provider won't be changed
    matching_courses = (app_models.Course.objects
        .filter(spider_name=spider_name,
            # is_manually_added=false, # honour manually added data
                url=url))

    if matching_courses.exists():
        course = matching_courses[0]

        # update course name
        course.name = name
        course.save()

        #TODO: test this!
        # update date ranges
        if date_ranges is not None:
            # Delete existing date ranges
            (app_models.CourseDate.objects
                 .filter(course=course)
                 .delete())

            # Add course dates
            create_course_dates(date_ranges)

        # update public_cpd
        (app_models.CourseCpdPoints.objects
             .filter(course=course)
             .update(points=public_cpd))

        # update the level
        level_obj = app_models.Level.objects.get(name=level)
        (app_models.CourseLevel.objects
            .filter(course=course)
            .update(level=level_obj))

        return json_response("Updated matching Course")

    # Otherwise, update/create the ScrapedCourse:
    # From the Django docs: "If a match is found, it updates the fields passed
    # in the defaults dictionary."
    scraped_course, created = models.ScrapedCourse.objects.update_or_create(
        defaults={
            "public_cpd": public_cpd,
            "provider": provider,
            "level": level,
            "name": name
        },
        spider_name=spider_name,
        url=course_data["url"],
        is_new=True)

    if created:
        create_course_dates(date_ranges)

        return json_response("Added ScrapedCourse")
    else:
        return json_response("Updated ScrapedCourse")

    return json_response("No action taken")
