from django.shortcuts import render

def index(request):
    """
    View for /
    """
    return render(request, "cms/index.html")
