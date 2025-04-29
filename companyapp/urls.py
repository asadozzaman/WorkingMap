

from django.urls import path
from . import views

urlpatterns = [
    path('company/', views.company, name='company'),
 
]
