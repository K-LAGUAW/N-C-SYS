from django.shortcuts import render

def create_shipment(request):
    return render(request, 'pages/shipments.html')