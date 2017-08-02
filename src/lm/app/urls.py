"""
URL patterns for the app.
"""
from django.conf.urls import url
from django.contrib.auth import views as auth_views

from . import views

urlpatterns = [
    url(r'^accounts/login/$', auth_views.login, name='login'),
    url(r'^accounts/logout/$', auth_views.logout, {'next_page': '/accounts/login'}, name='logout'),
    url(r'^$', views.index, name='index'),
    url(r'^.*/$', views.index, name='index'),
    url(r'^qns$', views.qns_and_opts, name='qns_and_opts'),
    url(r'^courses$', views.courses, name='courses'),
    url(r'^roles$', views.roles, name='roles'),
]
