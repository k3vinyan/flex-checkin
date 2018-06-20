from django.conf.urls import url, include
from . import views

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^/update', views.update, name='update'),
    url(r'^/unplannedRoute', views.unplannedRoute, name='unplannedRoute'),
]
