from django.urls import path
from . import views

urlpatterns = [
    path('shipment/', views.create_shipment, name='shipment'),
]