"""
URL patterns for the CMS.
"""
from django.conf.urls import url
from django.contrib.auth import views as auth_views
from django.contrib.auth.views import LoginView
from . import views

urlpatterns = [
    url(r'^accounts/login/$',
        # auth_views.login,
        LoginView.as_view(template_name='cms/registration/login.html'),
        name='login'),
    url(r'^accounts/logout/$', auth_views.logout,
        {'next_page': '/cms/accounts/login'}, name='logout'),

    url(r'^login/$', views.cms_login, name='cms_login'),

    url(r'^account_name/$', views.cms_account_name,
        name='cms_account_name'),

    url(r'^get_coursespage_data/$', views.cms_get_coursespage_data,
        name='cms_get_coursespage_data'),

    url(r'^scraper/sal/add_course/$', views.scraper_sal_add_course,
        name='scraper_add_course'),
    url(r'^$', views.index, name='cms_index'),
    url(r'^.+$', views.index, name='cms_index'),
]
