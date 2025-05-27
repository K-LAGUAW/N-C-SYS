from django.contrib import admin
from .models import Shipments, Parameters, PackageTypes, PaymentsTypes, PackagePrices, StatesList

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

@admin.register(Parameters)
class ParametersAdmin(admin.ModelAdmin):
    pass

@admin.register(Shipments)
class ShipmentsAdmin(admin.ModelAdmin):
    readonly_fields = ('total_amount', 'tracking_number', 'creation_date', 'update_date', 'payment_type', 'status')
    list_filter = ('status',)

    actions = ['mark_as_in_transit']

    def mark_as_in_transit(self, request, queryset):
        queryset.update(status=StatesList.objects.get(pk=2))
    mark_as_in_transit.short_description = "Marcar como en tránsito"