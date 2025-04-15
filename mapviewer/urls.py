

from django.urls import path
from . import views

urlpatterns = [
    path('', views.map_view, name='map'),
    path('save-shape/', views.save_shape, name='save_shape'),
    path('get-shapes/', views.get_shapes, name='get_shapes'),
]
