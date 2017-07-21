from django.shortcuts import render
from django.http import Http404
from django.http import HttpResponse
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required 
from app import models
import sys
import json



def _print(*args, **kwargs):
    """
    Helps to debug command-line output as viewed through Docker logs.
    sys.stdout.flush() ensures that the output is displayed as soon as it's
    printed.
    """
    print(*args, **kwargs)
    sys.stdout.flush()


def _json_response(obj):
    return HttpResponse(json.dumps(obj, separators=(',', ':')), 
            content_type="application/json")


@login_required
def index(request):
    return render(request, "app/index.html")


@login_required
def qns_and_opts(request):
    _print(request.user.is_authenticated)
    """
    Respond with a JSON representation of the quiz questions
    [{ "text": question_text, 
       "options": [ { "text": option_text }, ... ]}, ...]
    """

    def create_qn(qn_text, options):
        return { "text": qn_text, "options": options }

    qns = []

    qn1 = create_qn("What is your job?", 
            [{"text": v.option} for v in models.Vertical.objects.all()])

    qn2_opts = {}
    for row in models.VerticalCategory.objects.all():
        opt_num = row.vertical_id - 1
        if opt_num not in qn2_opts:
            qn2_opts[opt_num] = []
        qn2_opts[opt_num].append(row.option)

    qn2 = create_qn("What do you want to learn?", qn2_opts)

    qn3_opts = []
    for row in models.Need.objects.all():
        qn3_opts.append({"text": row.option})
    qn3 = create_qn("Why do you want to learn?", qn3_opts)

    qns.append(qn1)
    qns.append(qn2)
    qns.append(qn3)

    return _json_response(qns)


def _get_courses(vertical_id, vertical_category):
    return models.Course.objects.filter(
            courseverticalcategory__vertical_category__key=vertical_category,
            courseverticalcategory__vertical_category__vertical_id=vertical_id)


def _get_courses_any_category(vertical_id):
    return models.Course.objects.filter(
            courseverticalcategory__vertical_category__id=vertical_id)



@login_required
def courses(request):
    if "v" not in request.GET or "c" not in request.GET:
        raise Http404("Please provide the vertical and category IDs.")

    vertical_id = request.GET["v"]
    vertical_category = request.GET["c"]
    course_query = None

    if (vertical_category == "any"):
        course_query = _get_courses_any_category(vertical_id)
    else:
        try:
            vertical_id = int(vertical_id)
            vertical_category = int(vertical_category)
            course_query = _get_courses(vertical_id, vertical_category)
        except:
            raise Http404("The vertical and category IDs should be numeric.")
    
    courses = []
    for c in course_query:        
        start_dates = models.CourseStartDate.objects.filter(course=c)
        course_level = models.CourseLevel.objects.get(course=c)
        level = models.Level.objects.get(acronym=course_level.level_id)
        course_format = models.CourseFormat.objects.get(course=c)
        format_name  = models.Format.objects.get(
                acronym=course_format.format_id).name
        points = models.CourseCpdPoints.objects.get(course=c)


        cpd_points = points.points
        if cpd_points is None:
            cpd_points = 0

        courses.append({
            "name": c.name,
            "cost": float(c.cost),
            "start_dates": [x.start_date for x in start_dates],
            "level": level.name,
            "format": format_name,
            "cpd": {
                "points": float(cpd_points),
                "is_private": points.is_private
                }
            })
    return _json_response(courses)

