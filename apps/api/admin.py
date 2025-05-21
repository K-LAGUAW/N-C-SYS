from django.contrib import admin
from .models import Shipments, PackageTypes, PaymentsTypes, PackagePrices, StatesList

@admin.register(PackageTypes)
class PackageTypesAdmin(admin.ModelAdmin):
    pass

@admin.register(PackagePrices)
class PackagePricesAdmin(admin.ModelAdmin):
    pass

@admin.register(PaymentsTypes)
class PaymentsTypesAdmin(admin.ModelAdmin):
    pass

@admin.register(StatesList)
class StatusListAdmin(admin.ModelAdmin):
    pass

@admin.register(Shipments)
class Shipments(admin.ModelAdmin):
    readonly_fields = ('qr_code', 'total_amount', 'tracking_number', 'creation_date', 'update_date', 'payment_type', 'status')