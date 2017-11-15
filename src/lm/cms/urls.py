"""
URL patterns for the CMS.
"""
from django.conf.urls import url
from django.contrib.auth import views as auth_views
from django.contrib.auth.views import LoginView
from . import views

urlpatterns = [
    url(r'^accounts/login/$',
        LoginView.as_view(template_name='cms/registration/login.html'),
        name='login'),
    url(r'^accounts/logout/$', auth_views.logout,
        {'next_page': '/cms/accounts/login'}, name='cms_logout'),

    url(r'^login/$', views.cms_login, name='cms_login'),

    url(r'^account_name/$', views.cms_account_name,
        name='cms_account_name'),

    url(r'^get_published_courses_data/$',
        views.cms_get_published_courses_data,
        name='cms_get_published_courses_data'),

    url(r'^get_unpublished_courses_data/$',
        views.cms_get_unpublished_courses_data,
        name='cms_get_unpublished_courses_data'),

    url(r'^delete_course/$',
        views.delete_course,
        name="cms_delete_course"),

    url(r'^save_course/$',
        views.save_course,
        name="cms_save_course"),

    url(r'^scraper/sal/add_course/$', views.scraper_sal_add_course,
        name='scraper_add_course'),

    url(r'^$', views.index, name='cms_index'),

    url(r'^.+$', views.index, name='cms_index'),
]
