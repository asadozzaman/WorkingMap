from django.shortcuts import render
from django.http import JsonResponse
# from .models import Parcel
import json

def map_view(request):
    return render(request, 'mapviewer/index.html')

from django.views.decorators.csrf import csrf_exempt
from .models import Parcel
import json

@csrf_exempt
def save_shape(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        geojson = data.get('geojson')
        area = data.get('area')
        name = data.get('name', 'Unnamed Parcel')

        Parcel.objects.create(name=name, area=area, geojson=json.dumps(geojson))
        return JsonResponse({'status': 'saved'})

    return JsonResponse({'error': 'Only POST allowed'}, status=400)

def get_shapes(request):
    parcels = Parcel.objects.all()
    result = []

    for p in parcels:
        geo = json.loads(p.geojson)
        geo['properties'] = {
            'name': p.name,
            'area': p.area
        }
        result.append(geo)

    return JsonResponse(result, safe=False)

