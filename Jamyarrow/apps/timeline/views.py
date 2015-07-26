from django.shortcuts import render, redirect, get_object_or_404
from django.core.urlresolvers import reverse
from django.http import Http404, HttpResponse
from core.models import *
from home.forms import *
from mimetypes import guess_type
from django.utils import timezone
from django.conf import settings
from django.utils.dateparse import parse_datetime
from django.contrib.auth.decorators import login_required
from django.db import transaction
import json, os, sys, shutil

@login_required
def timeline(request):
    context = {}
    context['timeline_active'] = True

    patient = Patient.objects.get(user=request.user)
    context['patient'] = patient

    event_filter = {
        "MS": "milestone",
        "TS": "test-result",
        "AP": "appointment",
        "PS": "prescription",
        "ME": "my-event"
    }

    events = TimelineEvent.objects.filter(patient=patient)
    events = sorted(events, key=lambda event: event.time, reverse=True)
    for event in events:
        event.category = event_filter[event.category]
    context['events'] = events

    return render(request, 'timeline/main.html', context)

@transaction.atomic
@login_required
def add_event(request):
    context = {}
    errors = []
    data = {}

    patient = Patient.objects.get(user=request.user)
    if not request.POST:
		errors.append('Request must be sent via POST')
		data['errors'] = errors
		return HttpResponse(json.dumps(data), content_type='application/json')
    else:
        # We have to convert time to django format
        if 'time' in request.POST and request.POST['time']:
            event_time = request.POST['time']
            month = event_time.split('/')[0]
            day = event_time.split('/')[1]
            year = event_time.split('/')[2][:4]
            hour = event_time.split(' ')[1][:2]
            hour = hour[0] if hour[1] == ":" else hour
            minute = event_time.split(':')[1][:2]
            if event_time.split(':')[1][-2:] == "PM" and hour != "12":
                hour = str(int(hour) + 12)
            formatted_time = year + "-" + month + "-" + day + " " + hour + ":" + minute
        else:
            formatted_time = timezone.localtime(timezone.now())

        if 'attachment' in request.FILES:
            file_upload = request.FILES['attachment']
        else:
            file_upload = None

        new_event = TimelineEvent(patient=patient,
                                    name=request.POST['name'],
                                    time=formatted_time,
                                    description=request.POST['description'],
                                    category=request.POST['category'],
                                    attachment=file_upload)

        new_event.save()
        print "Saved!!"
        data['errors'] = ""
        data['event_id'] = new_event.id

        # do a manual copy of files.. need to change
        src = settings.BASE_DIR + "/Jamyarrow/media/timeline/"
        dest = settings.BASE_DIR + "/Jamyarrow/apps/timeline/media/"
        dest2 = settings.BASE_DIR + "/Jamyarrow/apps/match/media/"

        orig_files = os.listdir(src)
        for file_name in orig_files:
            full_file_name = os.path.join(src, file_name)
            if (os.path.isfile(full_file_name)):
                shutil.copy(full_file_name, dest)
                shutil.copy(full_file_name, dest2)

        return HttpResponse(json.dumps(data), content_type='application/json')

@transaction.atomic
@login_required
def edit_event(request):
    context = {}
    errors = []
    data = {}
    if not request.POST:
		errors.append('Request must be sent via POST')
		data['errors'] = errors
		return HttpResponse(json.dumps(data), content_type='application/json')

    else:
        patient = Patient.objects.get(user=request.user)
        event = get_object_or_404(TimelineEvent, id=request.POST['id'])
        # We have to convert time to django format
        if 'time' in request.POST and request.POST['time']:
            event_time = request.POST['time']
            month = event_time.split('/')[0]
            day = event_time.split('/')[1]
            year = event_time.split('/')[2][:4]
            hour = event_time.split(' ')[1][:2]
            hour = hour[0] if hour[1] == ":" else hour
            minute = event_time.split(':')[1][:2]
            if event_time.split(':')[1][-2:] == "PM" and hour != "12":
                hour = str(int(hour) + 12)
            formatted_time = year + "-" + month + "-" + day + " " + hour + ":" + minute
        else:
            formatted_time = timezone.localtime(timezone.now())

        if request.POST['name']:
            event.name = request.POST['name']
        if request.POST['time']:
            event.time = formatted_time
        if request.POST['description']:
            event.description = request.POST['description']
        event.category = request.POST['category']
        if 'attachment' in request.FILES:
            event.attachment = request.FILES['attachment']

        event.save()
        print "Saved!!"
        data['errors'] = ""
        data['event_id'] = event.id

        # do a manual copy of files.. need to change
        src = settings.BASE_DIR + "/Jamyarrow/media/timeline/"
        dest = settings.BASE_DIR + "/Jamyarrow/apps/timeline/media/"
        dest2 = settings.BASE_DIR + "/Jamyarrow/apps/match/media/"

        orig_files = os.listdir(src)
        for file_name in orig_files:
            full_file_name = os.path.join(src, file_name)
            if (os.path.isfile(full_file_name)):
                shutil.copy(full_file_name, dest)
                shutil.copy(full_file_name, dest2)

        return HttpResponse(json.dumps(data), content_type='application/json')

@transaction.atomic
@login_required
def delete_event(request):
    print request
    context = {}
    errors = []
    data = {}
    if not request.POST:
		errors.append('Request must be sent via POST')
		data['errors'] = errors
		return HttpResponse(json.dumps(data), content_type='application/json')

    else:
        event = get_object_or_404(TimelineEvent, id=request.POST['id'])
        event.delete()

        return HttpResponse(json.dumps(data), content_type='application/json')
