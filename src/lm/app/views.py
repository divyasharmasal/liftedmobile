from django.shortcuts import render
from django.http import HttpResponseServerError
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
    qn3 = create_qn("I want to...", qn3_opts)

    qn4_opts = [
                    {"text": "A law firm."}, 
                    {"text": "A corporation or organisation."}
               ]
    qn4 = create_qn("I work at...", qn4_opts)

    qn5_opts = [
                    {"text": "Prepare for my next job or role."}, 
                    {"text": "Get better at my current job."}
               ]
    qn5 = create_qn("I want to...", qn5_opts)

    qns.append(qn1)
    qns.append(qn2)
    qns.append(qn3)
    qns.append(qn4)
    qns.append(qn5)

    return _json_response(qns)


@login_required
def courses(request):
    if "v" not in request.GET or "c" not in request.GET:
        return HttpResponseServerError("Please provide the vertical and "
                                       "category IDs.")

    vertical_id = request.GET["v"]
    vertical_category = request.GET["c"]
    need_ids = request.GET["n"].strip()
    course_query = None

    if len(need_ids) == 0:
        need_ids = "any"
    elif need_ids != "any":
        try:
            need_ids = [int(x) for x in need_ids.split(",")]
        except:
            return HttpResponseServerError("Invalid need IDs")


    if (vertical_category == "any" and need_ids == "any"):
        try:
            course_query = models.Course.objects.filter(
                    courseverticalcategory__vertical_category__id=vertical_id)
        except:
            return HttpResponseServerError("Error code 0")

    elif (vertical_category == "any" and need_ids != "any"):
        try:
            course_query = models.Course.objects.filter(
                    courseverticalcategory__vertical_category__id=vertical_id,
                    courselevel__level_id__needlevel__need_id__in=need_ids)
        except:
            return HttpResponseServerError("Error code 1")

    elif (vertical_category != "any" and need_ids == "any"):
        try:
            vertical_id = int(vertical_id)
            vertical_category = int(vertical_category)
            course_query = models.Course.objects.filter(
                courseverticalcategory__vertical_category__key=vertical_category,
                courseverticalcategory__vertical_category__vertical_id=vertical_id)
        except:
            return HttpResponseServerError("Error code 2")
    else:
        try:
            vertical_id = int(vertical_id)
            vertical_category = int(vertical_category)
            course_query = models.Course.objects.filter(
                courseverticalcategory__vertical_category__key=vertical_category,
                courseverticalcategory__vertical_category__vertical_id=vertical_id,
                courselevel__level_id__needlevel__need_id__in=need_ids)
        except e:
            return HttpResponseServerError("Error code 3")
    
    courses = []
    for c in course_query.distinct():
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


# @login_required
def roles(request):
    """
    Used by RoleScreen for the diagnostic
    """
    if "o" not in request.GET or \
       "v" not in request.GET:
        return HttpResponseServerError("Please provide the org type and "
                                       "vertical params.")
    org_type = request.GET["o"]
    vertical_id = request.GET["v"]
    org_type_name = None

    try:
        org_type = int(org_type)
        vertical_id = int(vertical_id)
    except:
        return HttpResponseServerError("Please provide valid "
                                       "workplace/vertical params.")

    if org_type == 0:
        org_type_name = "Law firm"
    elif org_type == 1:
        org_type_name = "In-house"
    else:
        return HttpResponseServerError("Please provide org_type/vertical "
                                       "params that correspond to the "
                                       "right org_type.")
    role_num = None
    if "r" in request.GET:
        try:
            role_num = int(request.GET["r"])
        except:
            return HttpResponseServerError("Please provide a valid "
                                           "role number.")

    job_role_query = None
    vertical = models.Vertical.objects.get(id=vertical_id)

    if role_num is not None:
        role = models.JobRole.objects.get(id=role_num)
        job_role_query = models.JobRole.objects.filter(
                role_level__gte=role.role_level,
                org_type=org_type_name, 
                vertical=vertical).exclude(
                    role_level=role.role_level,
                        )
    else:
        job_role_query = models.JobRole.objects.filter(
                org_type=org_type_name, vertical=vertical)


    job_roles = sorted([{ 
        "name": job_role.name, 
        "desc": job_role.thin_desc,
        "level": job_role.role_level,
        "id": job_role.id,
        } for job_role in job_role_query.distinct()], 
        key=lambda j: j["level"])
    return _json_response(job_roles)
