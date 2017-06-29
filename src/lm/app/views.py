from django.shortcuts import render
from django.http import HttpResponse
from django.http import JsonResponse
from app.models import Question, Option
import sys
import json



def _print(*args, **kwargs):
    print(*args, **kwargs)
    sys.stdout.flush()


def _json_response(obj):
    return HttpResponse(json.dumps(obj, separators=(',', ':')), 
            content_type="application/json")


def index(request):
    return render(request, "app/index.html")


def qns_and_opts(request):
    qns = []
    questions = Question.objects.order_by("index")
    for question in questions:
        qn = { 
                "text": question.text,
                "options": []
             }
        options = Option.objects.filter(question=question).order_by("index")
        for option in options:
            qn["options"].append({
                "text": option.text,
            })
        qns.append(qn)

    return _json_response(qns)
