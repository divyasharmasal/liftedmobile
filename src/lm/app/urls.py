"""
URL patterns for the frontend.
"""

from django.conf.urls import url
from django.contrib.auth import views as auth_views

from . import views

urlpatterns = [
    url(r'^accounts/login/$', auth_views.login, name='login'),
    url(r'^accounts/logout/$', auth_views.logout,
        {'next_page': '/accounts/login'},
        name='logout'),

    url(r'^$', views.index, name='index'),
    url(r'^terms/$', views.terms_of_use, name='index'),
    url(r'^.*/$', views.index, name='index'),

    url(r'^qns$', views.qns_and_opts, name='qns_and_opts'),
    url(r'^course_recs$', views.course_recs, name='course_recs'),
    url(r'^course_browse$', views.course_browse, name='course_browse'),
    url(r'^roles$', views.roles, name='roles'),

    url(r'^techdiag$', views.tech_diag, name='tech_diag'),
    url(r'^diag$', views.diag, name='diag'),

    url(r'^results$', views.results, name='results'),

    url(r'^techdiagresults$', views.tech_diag_results,
        name='tech_diag_results'),
]
