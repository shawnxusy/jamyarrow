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
import re

from django.db.models import Q

@login_required
def match(request):
    context = {}

    patient = Patient.objects.get(user=request.user)
    context['patient'] = patient

    if not patient.case_match_tour:
        return render(request, 'match/privacy_setting.html', context)

    else:
        if request.method == "GET":
            exact_matched_patients = Patient.objects.exclude(name = patient.name)
            exact_matched_patients = exact_matched_patients.filter(cancer_type = patient.cancer_type)
            exact_matched_patients = exact_matched_patients.filter(cancer_stage = patient.cancer_stage)
            exact_matched_patients = exact_matched_patients.filter(age__range = (patient.age - 5, patient.age + 5))
            context["result_patients"] = exact_matched_patients
            return render(request, 'match/main.html', context)
        else: #POST
            keywords = (request.POST['q'] + " " + request.POST['qreal']) if request.POST['q'] != "" else request.POST['qreal']
            # Look for exact matches
            exact_matched_patients = Patient.objects.exclude(name = patient.name)
            result_patients = []
            if "type" in request.POST and "stage" in request.POST:
                exact_matched_patients = exact_matched_patients.filter(cancer_type = patient.cancer_type)
                exact_matched_patients = exact_matched_patients.filter(cancer_stage = patient.cancer_stage)
            if "age" in request.POST:
                exact_matched_patients = exact_matched_patients.filter(age__range = (patient.age - 5, patient.age + 5))
            if keywords != "":
                found_entries = None
                entry_query = get_query(keywords, ['name', 'description',])

                found_events = TimelineEvent.objects.filter(entry_query)
                for e in found_events:
                    if e.patient in exact_matched_patients:
                        result_patients.append(e.patient)
            else:
                result_patients = exact_matched_patients
            context["prev_keywords"] = keywords.split(" ") if len(keywords) != 0 else []
            context["result_patients"] = result_patients

            return render(request, 'match/main.html', context)


def match_strict(request):
    return match(request)

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
    patient.case_match_tour = True if request.POST['commit_change'] == "true" else False

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

    events = TimelineEvent.objects.filter(patient=target)
    events = sorted(events, key=lambda event: event.time, reverse=True)
    visible_events = []
    for event in events:
        event.category = event_filter[event.category]
        if (event.category == "milestone" and target.milestone_visible) or (event.category == "test-result" and target.test_result_visible) or (event.category == "appointment" and target.appointment_visible) or (event.category == "prescription" and target.prescription_visible) or (event.category == "my-event" and target.my_event_visible):
            visible_events.append(event)

    context['events'] = visible_events

    return render(request, 'match/timeline_template.html', context)

def reset_privacy(request):
    context = {}
    patient = Patient.objects.get(user=request.user)
    context['patient'] = patient

    patient.case_match_tour = False
    patient.save()
    return redirect(reverse('match'))

def normalize_query(query_string,
                    findterms=re.compile(r'"([^"]+)"|(\S+)').findall,
                    normspace=re.compile(r'\s{2,}').sub):
    ''' Splits the query string in invidual keywords, getting rid of unecessary spaces
        and grouping quoted words together.
        Example:

        >>> normalize_query('  some random  words "with   quotes  " and   spaces')
        ['some', 'random', 'words', 'with quotes', 'and', 'spaces']

    '''
    return [normspace(' ', (t[0] or t[1]).strip()) for t in findterms(query_string)]

def get_query(query_string, search_fields):
    ''' Returns a query, that is a combination of Q objects. That combination
        aims to search keywords within a model by testing the given search fields.

    '''
    query = None # Query to search for every search term
    terms = normalize_query(query_string)
    for term in terms:
        or_query = None # Query to search for a given term in each field
        for field_name in search_fields:
            q = Q(**{"%s__icontains" % field_name: term})
            if or_query is None:
                or_query = q
            else:
                or_query = or_query | q
        if query is None:
            query = or_query
        else:
            query = query & or_query
    return query
