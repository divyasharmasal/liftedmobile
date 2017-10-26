"""
URL patterns for the CMS.
"""
from django.conf.urls import url
from django.contrib.auth import views as auth_views
from . import views

urlpatterns = [
    url(r'^accounts/login/$', auth_views.login, name='login'),
    url(r'^accounts/logout/$', auth_views.logout,
        {'next_page': '/accounts/login'}, name='logout'),
    url(r'^login/$', views.cms_login, name='cms_login'),

    url(r'^cms/account_name/$', views.cms_account_name,
        name='cms_account_name'),

    url(r'^cms/get_coursespage_data/$', views.cms_get_coursespage_data,
        name='cms_get_coursespage_data'),

    url(r'^.*$', views.index, name='cms_index'),
    url(r'^$', views.index, name='cms_index'),
]
