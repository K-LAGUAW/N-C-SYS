from rest_framework import serializers
from . models import Shipments, PackagePrices, PackageTypes

class ShipmentSerializer(serializers.ModelSerializer):
    creation_date = serializers.DateTimeField(format="%d-%m-%Y %H:%M")
    update_date = serializers.DateTimeField(format="%d-%m-%Y %H:%M")

    class Meta:
        model = Shipments
        fields = '__all__'

class ShipmentCreateSerializer(serializers.ModelSerializer):
    creation_date = serializers.DateTimeField(format="%d-%m-%Y %H:%M", read_only=True)
    update_date = serializers.DateTimeField(format="%d-%m-%Y %H:%M", read_only=True)
    
    class Meta:
        model = Shipments
        fields = '__all__'
        read_only_fields = ('traking_number', 'status', 'total_amount', 'qr_code', 'payment_type')

class PackagePricesSerializer(serializers.ModelSerializer):
    class Meta:
        model = PackagePrices
        fields = '__all__'

class PackageTypesSerializer(serializers.ModelSerializer):
    class Meta:
        model = PackageTypes
        fields = '__all__'