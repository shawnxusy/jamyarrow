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
def match(request):
    context = {}

    patient = Patient.objects.get(user=request.user)
    context['patient'] = patient

    if not patient.case_match_tour:
        return render(request, 'match/privacy_setting.html', context)

    else:
        return render(request, 'match/main.html', context)


def save_settings(request):
    context = {}
    data = {}

    patient = Patient.objects.get(user=request.user)
    patient.profile_visible = True if request.POST['profile_visible'] == "true" else False
    patient.contact_visible = True if request.POST['contact_visible'] == "true" else False
    patient.category_visible = True if request.POST['category_visible'] == "true" else False
    patient.doctor_visible = True if request.POST['doctor_visible'] == "true" else False
    patient.timeline_visible = True if request.POST['timeline_visible'] == "true" else False
    patient.milestone_visible = True if request.POST['milestone_visible'] == "true" else False
    patient.test_result_visible = True if request.POST['test_result_visible'] == "true" else False
    patient.appointment_visible = True if request.POST['appointment_visible'] == "true" else False
    patient.prescription_visible = True if request.POST['prescription_visible'] == "true" else False
    patient.my_event_visible = True if request.POST['my_event_visible'] == "true" else False

    patient.save()
    data["success"] = "success"

    return HttpResponse(json.dumps(data), content_type='application/json')

def view_timeline(request, user_id):
    context = {}
    patient = Patient.objects.get(user=request.user)
    context['patient'] = patient
    target = Patient.objects.get(id=user_id)
    context['target'] = target

    event_filter = {
        "MS": "milestone",
        "TS": "test-result",
        "AP": "appointment",
        "PS": "prescription",
        "ME": "my-event"
    }

    events = TimelineEvent.objects.filter(patient=patient)
    events = sorted(events, key=lambda event: event.time, reverse=True)
    visible_events = []
    for event in events:
        event.category = event_filter[event.category]
        if (event.category == "milestone" and target.milestone_visible) or (event.category == "test-result" and target.test_result_visible) or (event.category == "appointment" and target.appointment_visible) or (event.category == "prescription" and target.prescription_visible) or (event.category == "my-event" and target.my_event_visible):
            visible_events.append(event)

    context['events'] = visible_events

    return render(request, 'match/timeline_template.html', context)
