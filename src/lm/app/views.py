"""
Views for liftedmobile
"""

import json
import os
import base64
import datetime
import pytz
import hashids
from django.shortcuts import render
from django.http import HttpResponseServerError
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from django.db.models import Max
from django.db.models import F

from app import models


def gen_random_str(length=32):
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


# @login_required
def terms_of_use(request):
    return render(request, "app/terms.html")


# @login_required
def index(request):
    """
    View for /
    """
    return render(request, "app/index.html")


# @login_required
def qns_and_opts(request):
    """
    Respond with a JSON representation of the quiz questions
    [{ "text": question_text,
       "options": [ { "text": option_text }, ... ]}, ...]
    """

    def create_qn(qn_text, options):
        return {"text": qn_text, "options": options}

    qns = []
    qn1_opts = [
        {
            "text": v.option,
            "id": v.id
        }
        for v in models.Vertical.objects.all().order_by("id")]

    qn1 = create_qn("I am ...", qn1_opts)

    qn2_opts = {}
    for row in (models.VerticalCategory.objects
            .order_by("id")
            .exclude(name="Specialisms")): # TODO: remove after beta
        opt_num = row.vertical_id
        if opt_num not in qn2_opts:
            qn2_opts[opt_num] = []
        qn2_opts[opt_num].append({"text": row.name, "id": row.id})

    qn2 = create_qn("I want to develop my ...", qn2_opts)

    qn3_opts = []
    for row in models.Need.objects.all():
        qn3_opts.append({"text": row.option, "id": row.id})
    qn3 = create_qn("I want to focus on ...", qn3_opts)

    qn4_opts = [
        {"text": "A law firm.", "id": "Law firm"},
        {"text": "A corporation or organisation.", "id": "In-house"}
    ]
    qn4 = create_qn("I work at ...", qn4_opts)

    qn5_opts = [
        {"text": "Prepare for my next job or role.", "id": 0},
        {"text": "Get better at my current job.", "id": 1}
    ]
    qn5 = create_qn("I want to ...", qn5_opts)

    tech_roles = [{
        "text": v.option,
        "name": v.name,
        "id": v.id
    } for v in models.TechRole.objects.all()]

    tech_role_qn = create_qn("I am a ...", tech_roles)

    qns = {
        "vertical": qn1,
        "comp_category": qn2,
        "need": qn3,
        "where": qn4,
        "goal": qn5,
        "tech_role": tech_role_qn,
    }

    return json_response(qns)


def _option_param(request, default, key, opts, error_msg):
    param = default
    if key in request.GET:
        try:
            param = int(request.GET[key])
            if param not in opts.keys():
                raise Exception(error_msg)
        except Exception as e:
            raise Exception(error_msg)
    return param


def _numeric_param(request, default, key, error_msg, positive=True):
    param = default
    if key in request.GET:
        try:
            param = int(request.GET[key])
            if positive and param < 0:
                raise Exception(error_msg)
        except Exception as e:
            raise Exception(error_msg)
    return param


def _date_param(request, default, key, error_msg):
    param = default
    if key in request.GET:
        timezone = pytz.timezone("UTC")
        date_fmt = "%Y-%m-%d"
        parsed_date = datetime.datetime.strptime(request.GET[key], date_fmt)
        param = timezone.localize(parsed_date)

        return param


# @login_required
def course_browse(request):
    """
    Respond with a JSON string with a list of courses. Each course
    will be represented by a dict containing the following keys:
    {
        "name": course.name,
        "cost": float(course.cost),
        "url": course.url,
        "date_range": {
            "start": ___,
            "end": ___
        },
        "level": level.name,
        "format": format_name,
        "cpd": {
            "points": float(cpd_points),
            "is_private": points.is_private
            }
        }
    }

    If a course has more than one start date, it should show up as a
    separate course.

    GET params:
    @c: filter by private/public CPD points (default: 2)
        - 0: public (is_private=False)
        - 1: private (is_private=True)
        - 2: both
    @s: sort by (default: asc date):
        - 0: date
        - 1: CPD points
        - 2: cost
    @o: sort order
        - 0: asc (default)
        - 1: desc
    @p: TODO: filter by provider (default: none)
        - 0: SAL
        - 1: SILE CALAS
    @sd: start date in UTC (inclusive) (default: none)
        - YYYY-MM-DD format
    @ed: end date in UTC (inclusive) (default: none)
        - YYYY-MM-DD format
    @pg: pagination (default: 0)
        - 0: results 1-30
        - 1: results 31-60
        - n: (30n + 1) to (30n + 30), index starting from 1
    @q: search query (default: None)
    @og: show ongoing courses (default: 1)
        - 1: True
        - 0: False

    Respond with an error in the following situations:
        - @sd > @ed
        - @pg is not an integer
        - @p is not an integer and falls outside the predefined keys
        - @s is not an integer and falls outside the predefined keys
    """

    PAGE_SIZE = 30

    SHOW_ONGOING_OPTS = {
        0: False,
        1: True
    }

    CPD_OPTS = {
        0: False,
        1: True,
        2: "both"
    }

    CPD_SORT = "CPD_SORT"
    DATE_SORT = "DATE_SORT"

    SORT_OPTS = {
        # 0: "start",
        0: DATE_SORT,
        # 1: "course__coursecpdpoints__points",
        1: CPD_SORT,
        2: "course__cost",
    }

    ASC = "-"
    ORDER_OPTS = {
        0: "",
        1: ASC
    }

    show_ongoing_param = _option_param(request, 1, "og", SHOW_ONGOING_OPTS,
                               "Invalid show_ongoing param")
    sort_param = _option_param(request, 0, "s", SORT_OPTS,
                               "Invalid sort param")
    cpd_param = _option_param(request, 2, "c", CPD_OPTS,
                              "Invalid CPD param")
    order_param = _option_param(request, 0, "o", ORDER_OPTS,
                                "Invalid order param")
    page_param = _numeric_param(request, 0, "pg", "Invalid page param",
                                positive=True)

    search_param = None
    if "q" in request.GET:
        search_param = str(request.GET["q"]).strip()
        if len(search_param) == 0:
            search_param = None

    start_page = PAGE_SIZE * page_param
    end_page = start_page + PAGE_SIZE

    start_date_param = _date_param(request, None, "sd", "Invalid start date")
    end_date_param = _date_param(request, None, "ed", "Invalid end date")

    cd_query = _optimise_course_date_query(models.CourseDate.objects.all())

    if CPD_OPTS[cpd_param] != "both":
        cd_query = cd_query.filter(
            course__coursecpdpoints__is_private=CPD_OPTS[cpd_param])

    if start_date_param is not None:
        cd_query = (
            cd_query
            .filter(start__gte=start_date_param)
            # .exclude(course__is_ongoing=True)
        )
    if end_date_param is not None:
        cd_query = (
            cd_query
            .filter(start__lte=end_date_param)
            # .exclude(course__is_ongoing=True)
        )

    ongoing_without_dates = []
    for c in models.Course.objects \
        .filter(is_ongoing=True) \
        .filter(coursedate__isnull=True):

        ongoing_without_dates.append(c)

    # cd_query = cd_query[start_page:end_page]

    if search_param is not None:
        cd_query = cd_query.filter(course__name__icontains=search_param)

    if not SHOW_ONGOING_OPTS[show_ongoing_param]:
        cd_query = cd_query.exclude(course__is_ongoing=True)

    if SORT_OPTS[sort_param] == CPD_SORT:
        result = []
        j = 0
        for i, cd in enumerate(cd_query):
            result.append(_course_json(cd.course,
                index=i,
                date_range=extract_date_range(cd)))
            j += 1

        for course in ongoing_without_dates:
            result.append(_course_json(course, index=j))
            j += 1

        priv_courses = list(filter(lambda c: c["cpd"]["is_private"], result))
        tbc_courses = list(filter(lambda c: c["cpd"]["is_tbc"], result))
        na_courses = list(filter(lambda c: c["cpd"]["is_na"], result))
        pts_courses = list(filter(lambda c: c["cpd"]["points"] is not None, result))
        pts_courses = list(sorted(pts_courses, key=lambda c: c["cpd"]["points"]))

        if ORDER_OPTS[order_param] == ASC:
            pts_courses = list(reversed(pts_courses))

        return json_response(pts_courses + tbc_courses + priv_courses + na_courses)
    
    elif SORT_OPTS[sort_param] == DATE_SORT:
        ongoing_courses = (
            cd_query
            .filter(course__is_ongoing=True)
            .order_by(
                ORDER_OPTS[order_param] + "start", "course__id") 
        )
        
        other_courses = (
            cd_query
            .exclude(course__is_ongoing=True)
            .order_by(
                ORDER_OPTS[order_param] + "start", "course__id") 
        )

        result = (
            [_course_json(cd.course, index=i, date_range=extract_date_range(cd))
                for i, cd in enumerate(other_courses)] +
            [_course_json(cd.course, index=i, date_range=extract_date_range(cd))
                for i, cd in enumerate(ongoing_courses)])

        if SHOW_ONGOING_OPTS[show_ongoing_param]:
            return json_response(result +
                [_course_json(course, index=i)
                    for i, course in enumerate(ongoing_without_dates)])
        else:
            return json_response(result)

    else:
        cd_query = cd_query.order_by(
            ORDER_OPTS[order_param] + SORT_OPTS[sort_param],
            "course__id")
        
        i = 0
        result = []
        for cd in cd_query:
            result.append(_course_json(cd.course,
                index=i,
                date_range=extract_date_range(cd)))
            i += 1

        return json_response(result)


def extract_date_range(course_date):
    start = end = None
    if course_date.start:
        start = course_date.start.isoformat()

    if course_date.end:
        end = course_date.end.isoformat()

    return {
        "start": start,
        "end": end
    }


# @login_required
def course_recs(request):
    """
    Respond with a list of courses that correspond to a given vertical and
    category ID.
    """
    vertical_id = \
        _numeric_param(request, None, "v", "Invalid vertical param", True)

    vertical_category_id = \
        _numeric_param(request, None, "c", "Invalid vertical category param",
                       True)

    need_ids = None
    if "n" in request.GET and len(request.GET["n"]) > 0:
        error = HttpResponseServerError("Invalid need param")
        try:
            need_ids = [int(x) for x in request.GET["n"].strip().split(",")]
            for n in need_ids:
                if n < 0:
                    return error
        except:
            return error


    timezone = pytz.timezone("UTC")
    now = timezone.localize(datetime.datetime.now()).isoformat()

    ongoing_course_query = (
        models.Course.objects.filter(is_ongoing=True, coursedate__isnull=True)
            .distinct()
    )
    
    cd_query = _optimise_course_date_query(
        models.CourseDate.objects.filter(start__gte=now)
        .distinct())

    if need_ids is not None:
        need_f_query = F("course__courselevel__level_id__needlevel__need_id")
        cd_query = cd_query.filter(
            course__courseverticalcategory__vertical_category__id=vertical_category_id,
            course__courseverticalcategory__vertical_category__vertical_id=vertical_id,
            course__courselevel__level_id__needlevel__need_id__in=need_ids,
            course__courseformat__format__needformat__need__in=need_f_query)
        
        course_need_f_query = F("_courselevel__level_id__needlevel__need_id")
        ongoing_course_query = ongoing_course_query.filter(
            courseverticalcategory__vertical_category__id=vertical_category_id,
            courseverticalcategory__vertical_category__vertical_id=vertical_id,
            courselevel__level_id__needlevel__need_id__in=need_ids,
            courseformat__format__needformat__need__in=course_need_f_query)
    else:
        cd_query = cd_query.filter(
            course__courseverticalcategory__vertical_category__id=vertical_category_id,
            course__courseverticalcategory__vertical_category__vertical_id=vertical_id)
        ongoing_course_query = ongoing_course_query.filter(
            courseverticalcategory__vertical_category__id=vertical_category_id,
            courseverticalcategory__vertical_category__vertical_id=vertical_id)

    for c in ongoing_course_query:
        print(c.name)

    result = (
        [_course_json(cd.course, date_range=extract_date_range(cd))
            for cd in cd_query] +
        [_course_json(course) for course in ongoing_course_query]
    )

    return json_response(result)


def _optimise_course_date_query(course_dates):
    return (course_dates
        .select_related("course")
        .select_related("course__courseformat__format")
        .select_related("course__courselevel__level")
        .select_related("course__coursecpdpoints")
        .prefetch_related("course__courselevel__level")
        .prefetch_related("course__coursedate_set")
        .prefetch_related("course__courseformat__format")
        .prefetch_related("course__coursecpdpoints"))


def _optimise_course_query(courses):
    return (
        courses
        .select_related("coursecpdpoints")
        .select_related("courselevel__level")
        .select_related("courseformat__format")
        .prefetch_related("coursedate_set")
    )


def _course_json(course,
                 index=None,
                 date_ranges=None,
                 date_range=None,
                 include_id=False,
                 include_lifted_keys=False):

    level_name = course.courselevel.level.name
    format_name = course.courseformat.format.name
    cpd_points = course.coursecpdpoints.points
    points = course.coursecpdpoints

    if cpd_points is not None:
        cpd_points = float(cpd_points)

    cost = None
    if course.cost is not None:
        cost = float(course.cost)

    course_cost = {
        "cost": cost,
        "isVarying": course.cost_is_varying,
    }

    result = {
        "name": course.name,
        "provider": course.provider,
        "cost": course_cost,
        "url": course.url,
        "level": level_name,
        "format": format_name,
        "spider_name": course.spider_name,
        "is_manually_added": course.is_manually_added,
        "is_ongoing": course.is_ongoing,
        "date_range": date_range,
        "cpd": {
            "points": cpd_points,
            "is_private": points.is_private,
            "is_tbc": points.is_tbc,
            "is_na": points.is_na,
        }
    }

    if date_ranges:
        result["date_ranges"] = date_ranges

    if include_lifted_keys:
        lifted_keys = []

        for cvc in course.courseverticalcategory_set.all():
            lifted_keys.append({
                "vertical_name": cvc.vertical_category.vertical.name,
                "vertical_category_name": cvc.vertical_category.name,
            })

        for tech_comp_cat in (course.coursetechcompetencycategory_set
                .select_related("tech_competency_category")):

            lifted_keys.append({
                "vertical_name": "Technology Framework",
                "vertical_category_name": tech_comp_cat.tech_competency_category.name
            })

        result["lifted_keys"] = lifted_keys

    if include_id:
        result["id"] = course.id

    if index is not None:
        result["index"] = index

    return result


# @login_required
def roles(request):
    """
    Repsond with a list of roles given the organisation type, vertical, and
    (optionally) current role. Used by RoleScreen for the diagnostic.
    """

    if "v" not in request.GET:
        return HttpResponseServerError("Please provide the vertical id.")

    vertical_id = request.GET["v"]
    try:
        vertical_id = int(vertical_id)
    except:
        return HttpResponseServerError(
            "Please provide valid workplace/vertical params.")

    org_type_name = "any"
    if "o" in request.GET:
        org_type_name = request.GET["o"]

    if org_type_name not in ["Law firm", "In-house", "any"]:
        return HttpResponseServerError(
            "Please provide org_type/vertical params that correspond to the "
            "right org_type.")

    role_num = None
    if "r" in request.GET:
        try:
            role_num = int(request.GET["r"])
        except:
            return HttpResponseServerError(
                    "Please provide a valid role number.")

    job_role_query = None
    vertical = models.Vertical.objects.get(id=vertical_id)

    # if the role num is specified, it's from /review/nextrole
    if role_num is not None:
        role = models.JobRole.objects.get(id=role_num)
        if org_type_name == "any":
            job_role_query = models.JobRole.objects \
                .filter(role_level__gte=role.role_level,
                        vertical=vertical,
                        role_level__lte=role.role_level+1) \
                .exclude(id=role_num)
        else:
            job_role_query = models.JobRole.objects \
                .filter(role_level__gte=role.role_level,
                        org_type=org_type_name,
                        vertical=vertical,
                        role_level__lte=role.role_level+1) \
                .exclude(id=role_num)

    # if it's not, it's from /review/
    else:
        if org_type_name == "any":
            job_role_query = models.JobRole.objects.filter(
                    vertical=vertical).distinct()
        else:
            job_role_query = models.JobRole.objects.filter(
                    org_type=org_type_name, vertical=vertical).distinct()

    job_roles = []
    for job_role in job_role_query:
        json = {
            "name": job_role.name,
            "desc": job_role.thin_desc,
            "level": job_role.role_level,
            "id": job_role.id,
        }

        if job_role.specialism is not None:
            json["specialism"] = job_role.specialism.name
            job_roles.append(json)
        else:
            job_roles.append(json)

    job_roles = sorted(job_roles, key=lambda j: j["level"])
    
    return json_response(job_roles)


# @login_required
def tech_diag(request):
    """
    Given a tech role ID, respond with the tech diagnostic questions.
    """
    role_num = _numeric_param(request, None, "r", "Invalid role param", True)
    tech_role = models.TechRole.objects.get(id=role_num)
    tech_competencies = (models.TechCompetency.objects
            .filter(category__tech_role=tech_role))

    result = []
    for comp in tech_competencies:
        result.append({
            "id": comp.id,
            "expln": comp.full_desc,
            "desc": comp.copy_title,
        })

    return json_response(result)


# @login_required
def diag(request):
    """
    Given a role ID, respond with the competency diagnostic questions.
    """
    role_num = None
    try:
        role_num = int(request.GET["r"])
    except:
        return HttpResponseServerError("Please provide a valid role num.")

    competencies = models.JobRoleCompetency.objects\
            .filter(job_role_id=role_num)\
            .select_related("competency")

    result = []
    for comp in competencies:
        result.append({
            "id": comp.competency.id,
            "expln": comp.competency.full_desc,
            "desc": comp.competency.copy_title,
        })

    return json_response(result)


# @login_required
def tech_diag_results(request):
    tech_role_id = _numeric_param(request, None, "r", "Invalid tech role param", True)
    tech_role = models.TechRole.objects.get(id=tech_role_id)
    answers = {}
    keys = []
    for k, v in request.GET.items():
        if k == "r":
            continue
        try:
            answers[k] = int(v)
            keys.append(k)
        except:
            return HttpResponseServerError(
                    "Invalid answer provided for %s" % k)
    # get competency categories
    tech_competencies = (
        models.TechCompetency.objects
            .filter(id__in=keys)
            .select_related("category")
    )

    categorised_answers = {}
    cat_names = {}

    for k, v in answers.items():
        # Scores:
        # 0 - yes - +1
        # 1 - no - -1
        if v not in [0, 1]:
            return HttpResponseServerError(
                    "Invalid answer provided for %s" % k)
        comp = None
        for c in tech_competencies:
            if c.id == int(k):
                comp = c
                break

        category = comp.category.name

        cat_names[category] = comp.category

        if category not in categorised_answers:
            categorised_answers[category] = {
                "total": 0,
                "yes": 0,
                "no": 0,
            }

        if v == 0:
            categorised_answers[category]["yes"] += 1
        elif v == 1:
            categorised_answers[category]["no"] += 1
        categorised_answers[category]["total"] += 1

    for category, scores in categorised_answers.items():
        # final result will be upon 100
        # base score is 50
        # Yes answers add to base and others deduct from it
        base = 50
        unit = base / scores["total"]
        result = base + \
            (scores["yes"] * unit) + \
            (scores["no"] * unit * -1)

        score = round(result)
        categorised_answers[category] = {
            "score": score,
        }

    response = {
        "competencies": categorised_answers,
        "courses": _tech_diag_course_recommendations(
            categorised_answers, tech_role),
    }

    return json_response(response)


def _tech_diag_course_recommendations(categorised_answers, tech_role):
    """
    Provides course recommendations based on:
    @categorised_answers: the scores for each competency category
    @tech_role: the user's selected tech role
    """

    # Obsfucate course IDs with a hashids function seeded with a
    # random salt
    hash_func = hashids.Hashids(min_length=4, salt=gen_random_str()).encode

    result = {
        "map": {},
        "courses": {},
    }

    timezone = pytz.timezone("UTC")
    now = timezone.localize(datetime.datetime.now()).isoformat()

    for category_name, score_info in categorised_answers.items():
        result["map"][category_name] = []
        cd_query = \
            models.CourseDate.objects.filter(
                start__gte=now,
                course__coursetechcompetencycategory__tech_competency_category__name=category_name
        ).distinct()

        cd_query = _optimise_course_date_query(cd_query)

        for cd in cd_query:
            course = cd.course
            cd_id = hash_func(cd.id)
            result["map"][category_name].append(cd_id)
            result["courses"][cd_id] = \
                _course_json(course, date_range=extract_date_range(cd))

    return result


# @login_required
def results(request):
    """
    Calculate the user's diagnostic scores and provide a list of
    recommended courses.

    GET params:
    v: vertical ID
    r: job role ID
    0, 1, 2, ...: competency ID. Remember, competencies are rephrased
    as questions.
    """

    answers = {}
    vertical_id = request.GET["v"]
    role_id = request.GET["r"]

    vertical = None
    job_role = None

    try:
        vertical_id = int(vertical_id)
        vertical = models.Vertical.objects.get(id=vertical_id)
    except:
        return HttpResponseServerError("Invalid vertical ID.")

    try:
        role_id = int(role_id)
        job_role = models.JobRole.objects.get(id=role_id)
    except:
        return HttpResponseServerError("Invalid job role ID.")

    keys = []
    for k, v in request.GET.items():
        if k == "v" or k == "r":
            continue
        try:
            answers[k] = int(v)
            keys.append(k)
        except:
            return HttpResponseServerError(
                    "Invalid answer provided for %s" % k)

    # get competency categories
    competencies = (
        models.Competency.objects
            .filter(id__in=keys)
            .select_related("category")
    )
    

    categorised_answers = {}
    cat_names = {}

    for k, v in answers.items():
        # Scores:
        # 0 - yes - +1
        # 1 - no - -1
        if v not in [0, 1]:
            return HttpResponseServerError(
                    "Invalid answer provided for %s" % k)

        # comp = competencies.get(id=k)
        # .get() queries the DB unnecessarily
        comp = None
        for c in competencies:
            if c.id == int(k):
                comp = c
                break

        category = comp.category.name

        special = False
        # Disabled for beta
        # if comp.specialism:
            # category = comp.specialism.name
            # special = True

        cat_names[category] = comp.category

        if category not in categorised_answers:
            categorised_answers[category] = {
                "total": 0,
                "yes": 0,
                "no": 0,
                "special": special
            }

        if v == 0:
            categorised_answers[category]["yes"] += 1
        elif v == 1:
            categorised_answers[category]["no"] += 1
        categorised_answers[category]["total"] += 1

    for category, scores in categorised_answers.items():
        # final result will be upon 100
        # base score is 50
        # Yes answers add to base and others deduct from it
        base = 50
        unit = base / scores["total"]
        result = base + \
            (scores["yes"] * unit) + \
            (scores["no"] * unit * -1)

        score = round(result)
        categorised_answers[category] = {
            "score": score,
            "special": categorised_answers[category]["special"]
        }

    response = {
        "competencies": categorised_answers,
        "courses": _diag_course_recommendations(
            categorised_answers, vertical, job_role),
    }

    return json_response(response)


def _get_courses_from_comps(job_role, vertical_id, competencies):
    if job_role is None:
        return models.Course.objects.filter(
            coursecompetency__competency__in=competencies,
            courseverticalcategory__vertical_category__vertical__id=vertical_id)\
            .distinct()
    else:
        return models.Course.objects.filter(
            coursecompetency__competency__jobrolecompetency__job_role=job_role,
            coursecompetency__competency__in=competencies,
            courseverticalcategory__vertical_category__vertical__id=vertical_id)\
            .distinct()


def _diag_course_recommendations(categorised_answers, vertical, job_role):
    """
    Provides course recommendations based on:
    @categorised_answers: the scores for each competency category
    @vertical: the user's job vertical
    @job_role: the user's selected job role
    """

    # Obsfucate course IDs with a hashids function seeded with a
    # random salt
    hash_func = hashids.Hashids(min_length=4, salt=gen_random_str()).encode

    result = {
        "map": {},
        "courses": {},
    }

    timezone = pytz.timezone("UTC")
    now = timezone.localize(datetime.datetime.now()).isoformat()

    for category_name, score_info in categorised_answers.items():
        cd_query = []
        result["map"][category_name] = []

        if score_info["special"]:
            real_cat_name = models.Competency.objects.filter(
                specialism__name=category_name,
                vertical=vertical,
                jobrolecompetency__job_role=job_role
            )[0].category.name

            cd_query = \
                models.CourseDate.objects.filter(
                    course__courseverticalcategory__vertical_category__name=real_cat_name,
                    course__courseverticalcategory__vertical_category__vertical=vertical)

        else:
            cd_query = \
                models.CourseDate.objects.filter(
                    course__courseverticalcategory__vertical_category__vertical=vertical,
                    course__courseverticalcategory__vertical_category__name=category_name)

        cd_query = _optimise_course_date_query(cd_query) \
                        .filter(start__gte=now)

        for cd in cd_query:
            cd_id = hash_func(cd.id)
            result["map"][category_name].append(cd_id)
            result["courses"][cd_id] = \
                _course_json(cd.course, date_range=extract_date_range(cd))

    return result
