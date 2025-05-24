import requests
import qrcode
import uuid
import os

from .models import Shipments, Parameters, PackagePrices, PackageTypes
from .serializers import ShipmentSerializer, ShipmentSearchSerializer, ShipmentCreateSerializer, PackagePricesSerializer, PackageTypesSerializer

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.generics import CreateAPIView, ListAPIView

from django.shortcuts import get_object_or_404

class ShipmentsView(ListAPIView):
    queryset = Shipments.objects.all().order_by('-creation_date')
    serializer_class = ShipmentSerializer

class CreateShipmentView(CreateAPIView):
    queryset = Shipments.objects.all()
    serializer_class = ShipmentCreateSerializer

    def perform_create(self, serializer):
        envelope_amount = serializer.validated_data.get('envelope_amount')
        package_pickup = serializer.validated_data.get('package_pickup')
        package_amount = serializer.validated_data.get('package_amount')

        total = 0
        
        if envelope_amount:
            total += envelope_amount * 0.01
        
        if package_pickup:
            total += 2500
            
        if package_amount:
            total += package_amount.mount

        package_type = serializer.validated_data.get('package_type')
        tracking_number = f"{package_type.abbreviation}-{str(uuid.uuid4())[:8].upper()}"

        whatsapp_number = serializer.validated_data.get('phone')
        whatsapp_url = Parameters.objects.get(name="whatsapp_url").value
        
        if package_type.abbreviation == 'TUR':
            message = Parameters.objects.get(name="message_tur").value.format(tracking_number=tracking_number)
        elif package_type.abbreviation == 'PAQ':
            message = Parameters.objects.get(name="message_paq").value.format(tracking_number=tracking_number)
            
        if package_type.abbreviation in ['TUR', 'PAQ']:
            payload = {
                "chatId": f"549{whatsapp_number}@c.us",
                "message": message
            }
            headers = {
                'Content-Type': 'application/json'
            }

            requests.post(whatsapp_url, json=payload, headers=headers)

        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=2,
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

class SearchShipmentView(APIView):
    def get(self, request, tracking_number):
        shipment = get_object_or_404(Shipments, tracking_number=tracking_number)
        serializer = ShipmentSearchSerializer(shipment)
        return Response(serializer.data)

class PackagesCategoriesView(APIView):
    def get(self, request):
        package_types = PackageTypes.objects.all()
        package_prices = PackagePrices.objects.all()

        return Response({
            'package_types': PackageTypesSerializer(package_types, many=True).data,
            'package_prices': PackagePricesSerializer(package_prices, many=True).data
        })