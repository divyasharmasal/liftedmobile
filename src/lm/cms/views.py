import os
import base64
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from django.shortcuts import redirect
from django.core.urlresolvers import reverse


def cms_login(request):
    username = request.POST["username"]
    password = request.POST["password"]
    next_url = request.POST["next"]

    user = authenticate(username=username, password=password)
    if user is not None:
        if user.is_staff:
            login(request, user)
            return redirect(reverse(next_url))

    return render(request, 
                "../../cms/templates/registration/login.html", 
                {"login_failed": True}
            )


def gen_cache_bust_str(length=32):
    """
    Returns a URL-friendly, 32-bit random string
    """

    return base64.urlsafe_b64encode(os.urandom(length)).rstrip(b'=').decode('ascii')


@login_required
def index(request):
    """
    View for /
    """

    return render(request, "cms/base.html",
            {"cache_bust": gen_cache_bust_str(10)})
