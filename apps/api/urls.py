from django.urls import path
from .views import ShipmentsView, CreateShipmentView, SearchShipmentView, PackagesCategoriesView

urlpatterns = [
    path('shipments/', ShipmentsView.as_view(), name='shipments'),
    path('create_shipment/', CreateShipmentView.as_view(), name='create_shipment'),
    path('search_shipment/<str:tracking_number>/', SearchShipmentView.as_view(), name='search_shipment'),
    path('packages_categories/', PackagesCategoriesView.as_view(), name='packages_categories'),
]