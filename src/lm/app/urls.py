from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^.*/$', views.index, name='index'),
    url(r'^qns$', views.qns_and_opts, name='qns_and_opts'),
]
