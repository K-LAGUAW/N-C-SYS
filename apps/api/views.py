import qrcode
import uuid
import os

from.models import Shipments, PackagePrices, PackageTypes

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.generics import CreateAPIView, ListAPIView
from.serializers import ShipmentCreateSerializer, PackagePricesSerializer, PackageTypesSerializer

class ShipmentsView(ListAPIView):
    queryset = Shipments.objects.all()
    serializer_class = ShipmentCreateSerializer

class CreateShipmentView(CreateAPIView):
    queryset = Shipments.objects.all()
    serializer_class = ShipmentCreateSerializer

    def perform_create(self, serializer):
        envelope_amount = serializer.validated_data.get('envelope_amount', 0) or 0
        package_pickups = serializer.validated_data.get('package_pickups', False)
        package_amount = serializer.validated_data.get('package_amount')

        total = 0
        
        if envelope_amount:
            total += envelope_amount * 0.1
        
        if package_pickups:
            total += 2500
            
        if package_amount:
            total += package_amount.mount


        package_type = serializer.validated_data.get('package_type')
        tracking_number = f"{package_type.abbreviation}-{str(uuid.uuid4())[:8].upper()}"
        
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )

        qr.add_data(tracking_number)
        qr.make(fit=True)

        qr_directory = 'media/qrcodes'
        os.makedirs(qr_directory, exist_ok=True)

        img = qr.make_image(fill_color="black", back_color="white")
        img.save(f'{qr_directory}/{tracking_number}.png')

        serializer.save(
            tracking_number=tracking_number,
            qr_code=f'qrcodes/{tracking_number}.png',
            total_amount=total
        )

class PackagesCategoriesView(APIView):
    def get(self, request):
        package_types = PackageTypes.objects.all()
        package_prices = PackagePrices.objects.all()

        return Response({
            'package_types': PackageTypesSerializer(package_types, many=True).data,
            'package_prices': PackagePricesSerializer(package_prices, many=True).data
        })