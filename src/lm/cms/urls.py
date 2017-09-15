"""
URL patterns for the CMS.
"""
from django.conf.urls import url
from django.contrib.auth import views as auth_views
from . import views

urlpatterns = [
    url(r'^account_name/$', views.cms_account_name, name='cms_account_name'),
    url(r'^get_courses/$', views.cms_get_courses, name='cms_get_courses'),
    url(r'^.*$', views.index, name='cms_index'),
    url(r'^login/$', views.cms_login, name='cms_login'),

    url(r'^accounts/login/$', auth_views.login,
        {'template_name': '../../cms/templates/registration/login.html'},
        name='login'),

    url(r'^accounts/logout/$', auth_views.logout,
        {'next_page': '/cms/accounts/login'},
        name='logout'),
]
