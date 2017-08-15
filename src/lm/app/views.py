"""
Views for liftedmobile
"""
import json
import os
import base64
import hashids
from django.shortcuts import render
from django.http import HttpResponseServerError
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from app import models


def gen_cache_bust_str():
    """
    Returns a URL-friendly, 32-bit random string
    """
    return base64.urlsafe_b64encode(os.urandom(32)).rstrip(b'=').decode('ascii')


def _json_response(obj):
    return HttpResponse(json.dumps(obj, separators=(',', ':')),
                        content_type="application/json")


@login_required
def index(request):
    """
    View for /
    """
    return render(request, "app/base.html",
                  {"cache_bust": gen_cache_bust_str()})


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
    qn3 = create_qn("I want...", qn3_opts)

    qn4_opts = [{"text": "A law firm."},
                {"text": "A corporation or organisation."}]
    qn4 = create_qn("I work at...", qn4_opts)

    qn5_opts = [{"text": "Prepare for my next job or role."},
                {"text": "Get better at my current job."}]
    qn5 = create_qn("I want to...", qn5_opts)

    qns = [qn1, qn2, qn3, qn4, qn5]

    return _json_response(qns)


@login_required
def courses(request):
    """
    Respond with a list of courses that correspond to a given vertical and
    category ID.
    """
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
    for course in course_query.distinct():
        courses.append(_course_json(course))
    return _json_response(courses)


def _course_json(course):
    start_dates = models.CourseStartDate.objects.filter(course=course)
    course_level = models.CourseLevel.objects.get(course=course)
    level = models.Level.objects.get(acronym=course_level.level_id)
    course_format = models.CourseFormat.objects.get(course=course)
    format_name  = models.Format.objects.get(
            acronym=course_format.format_id).name
    points = models.CourseCpdPoints.objects.get(course=course)
    cpd_points = points.points
    if cpd_points is None:
        cpd_points = 0
    result = {
        "name": course.name,
        "cost": float(course.cost),
        "start_dates": [x.start_date for x in start_dates],
        "level": level.name,
        "format": format_name,
        "cpd": {
            "points": float(cpd_points),
            "is_private": points.is_private
            }
        }
    return result


@login_required
def roles(request):
    """
    Repsond with a list of roles given the organisation type, vertical, and 
    (optionally) current role. Used by RoleScreen for the diagnostic.
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
    
    # if the role num is specified, it's from /test/nextrole
    if role_num is not None:
        role = models.JobRole.objects.get(id=role_num)
        job_role_query = models.JobRole.objects \
                .filter(role_level__gte=role.role_level,
                        role_level__lte=role.role_level+1) \
                .exclude(id=role_num)

    # if it's not, it's from /test/
    else:
        job_role_query = models.JobRole.objects.filter(org_type=org_type_name,
                                                       vertical=vertical)


    job_roles = sorted([{"name": job_role.name,
                         "desc": job_role.thin_desc,
                         "level": job_role.role_level,
                         "id": job_role.id} \
                              for job_role in job_role_query.distinct()
                       ], key=lambda j: j["level"])
    return _json_response(job_roles)


@login_required
def diag(request):
    """
    Given a role ID, respond with the competency diagnostic questions.
    """
    role_num = None
    try:
        role_num = int(request.GET["r"])
    except:
        return HttpResponseServerError("Please provide a valid role num.")

    role = models.JobRole.objects.get(id=role_num)
    competencies = models.JobRoleCompetency.objects.filter(job_role=role)

    result = []
    for comp in competencies:
        result.append({
            "id": comp.competency.id,
            "desc": comp.competency.copy_desc,
        })

    return _json_response(result)


@login_required
def results(request):
    """
    Retrieve data for the diagnostic results page
    """
    answers = {}
    vertical_id = request.GET["v"]
    vertical = None
    try:
        vertical_id = int(vertical_id)
        vertical = models.Vertical.objects.get(id=vertical_id)
    except:
        return HttpResponseServerError("Invalid vertical ID.")

    keys = []
    for k, v in request.GET.items():
        if k == "v":
            continue
        try:
            answers[k] = int(v)
            keys.append(k)
        except:
            return HttpResponseServerError("Invalid answer provided for %s" % k)

    # get competency categories
    competencies = models.Competency.objects.filter(id__in=keys)
    categories = [x.category for x in competencies]

    key = {0: 2, 1: -1, 2: -2}

    categorised_answers = {}
    cat_names = {}

    for k, v in answers.items():
        # Scores:
        # 0 - yes - +2
        # 1 - unsure - -1
        # 2 - no - -2
        if v not in key.keys():
            return HttpResponseServerError("Invalid answer provided for %s" % k)
        # score = key[v]

        comp = competencies.get(id=k)
        category = comp.category.name


        special = False
        if comp.specialism:
            category = comp.specialism
            special = True

        cat_names[category] = comp.category

        if category not in categorised_answers:
            categorised_answers[category] = { 
                    "total": 0, 
                    "yes":0,
                    "no": 0, 
                    "unsure": 0,
                    "special": special
                    }
        if v == 0:
            categorised_answers[category]["yes"] += 1
        elif v == 1:
            categorised_answers[category]["unsure"] += 1
        elif v == 2:
            categorised_answers[category]["no"] += 1
        categorised_answers[category]["total"] += 1

    cat_scores = {}

    for category, scores in categorised_answers.items():
        # final result will be upon 100
        # base score is 50
        # Yes answers add to base and others deduct from it
        base = 50
        unit = base / scores["total"]
        result = base + \
            (scores["yes"] * unit) + \
            (scores["no"] * unit * -1) + \
            (scores["unsure"] * unit * -0.5)

        score = round(result)
        cat_scores[cat_names[category]] = score
        categorised_answers[category] = {
                "score": score,
                "special": categorised_answers[category]["special"]
                }

    response = {
        "competencies": categorised_answers,
        "courses": courses_from_categories(cat_scores, vertical),
    }
    return _json_response(response)


def courses_from_categories(cat_scores, vertical):
    salt = gen_cache_bust_str()
    hash_func = hashids.Hashids(min_length=4,
            salt=gen_cache_bust_str()).encode

    result = {
        "map": {},
        "courses": {},
    }

    for category, score in cat_scores.items():
        if score < 50:
            comps = models.Competency.objects.filter(category=category)
            courses = models.Course.objects.filter(
                coursecompetency__competency__in=comps,
                courseverticalcategory__vertical_category__id=vertical.id).distinct()

            for course in courses:
                course_id = hash_func(course.id)
                if category.name in result["map"]:
                    result["map"][category.name].append(course_id)
                else:
                    result["map"][category.name] = [course_id]

                result["courses"][course_id] = _course_json(course)
    return result
