from django.shortcuts import render
from django.http import HttpResponse
from django.http import JsonResponse
from app import models
import sys
import json



def _print(*args, **kwargs):
    """
    Helps to debug command-line output as viewed through Docker logs.
    sys.stdout.flush() ensures that the output is displayed as soon as it's printed.
    """
    print(*args, **kwargs)
    sys.stdout.flush()


def _json_response(obj):
    return HttpResponse(json.dumps(obj, separators=(',', ':')), 
            content_type="application/json")


def index(request):
    return render(request, "app/index.html")


def qns_and_opts(request):
    """
    Respond with a JSON representation of the quiz questions
    [{ "text": question_text, 
       "options": [ { "text": option_text }, ... ]}, ...]
    """

    def create_qn(qn_text, options):
        return { "text": qn_text, "options": options }

    qns = []

    qn1 = create_qn("What is your job?", [{"text": v.option} for v in models.Vertical.objects.all()])

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
