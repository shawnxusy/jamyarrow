from django.shortcuts import render, redirect
from django.core.urlresolvers import reverse
from django.http import Http404, HttpResponse
from core.models import *
from home.forms import *
from django.utils import timezone
import json

# Homepage
def homepage(request):

	if not request.user.is_authenticated():
		return redirect(reverse('login'))

	context = {}
	patient = Patient.objects.get(user=request.user)
	context['patient'] = patient

	now = timezone.localtime(timezone.now()).strftime('%H')
	now = int(now[1]) if now[0] == '0' else int(now) #get the pure hour
	if now >=6 and now < 10:
		time_frame = 1 #wake up
	elif now >= 10 and now < 12:
		time_frame = 2 #morning
	elif now >= 12 and now < 14:
		time_frame = 3 #after lunch
	elif now >= 14 and now < 17:
		time_frame = 4 #afternoon
	elif now >= 17 and now < 20:
		time_frame = 5 #dinner
	elif now >= 20 and now <=24:
		time_frame = 6 #before sleep
	else:
		time_frame = 7 #during sleep

	current_tracked_items = patient.trackeditem_set.all()
	# We need to do some ranking to determine what to put at quick track
	ranked_tracked_items = {}
	for c in current_tracked_items:
		ranked_tracked_items[c] = 1
		if c.category == "SL":
			if time_frame == 1 or time_frame == 7:
				ranked_tracked_items[c] += 5
			if time_frame == 4:
				ranked_tracked_items[c] += 2
		elif c.category == "AT":
			if time_frame == 2 or time_frame == 4 or time_frame == 6:
				ranked_tracked_items[c] += 2
		elif c.category == "MD":
			ranked_tracked_items[c] += 1 #mood is always pretty important
			if time_frame == 1 or time_frame == 3 or time_frame == 5 or time_frame == 6:
				ranked_tracked_items[c] += 3
		elif c.category == "SY":
			ranked_tracked_items[c] += 3 #symptom is also important to track
		elif c.category == "ME":
			if time_frame == 3 or time_frame == 5:
				ranked_tracked_items[c] += 5
		else:
			ranked_tracked_items[c] = 1

	sorted_list = sorted(ranked_tracked_items, key=ranked_tracked_items.get, reverse=True)


	context['ranked_tracked_items'] = sorted_list
	context['home_hamburger'] = "home-hamburger"
	return render(request, 'home/index.html', context)


def add_tracked_item(request):
	context = {}
	patient = Patient.objects.get(user=request.user)

	if not ('category' in request.POST and request.POST['category']):
		context['add_tracked_item_form'] = AddTrackedItemForm()
		return render(request, 'home/add_tracked_item.html', context)

	else:
		add_tracked_item_form = AddTrackedItemForm(request.POST)
		context['add_tracked_item_form'] = add_tracked_item_form
		if not add_tracked_item_form.is_valid():
			return render(request, 'home/add_tracked_item.html', context)

		new_tracked_item = TrackedItem(patient=patient,
										name=add_tracked_item_form.cleaned_data['name'],
										category=add_tracked_item_form.cleaned_data['category'],
										severity=add_tracked_item_form.cleaned_data['severity'],
										duration=add_tracked_item_form.cleaned_data['duration'],
										quality=add_tracked_item_form.cleaned_data['quality'],
										quantity=add_tracked_item_form.cleaned_data['quantity'],
										yes_no=add_tracked_item_form.cleaned_data['yes_no'],
										goal=add_tracked_item_form.cleaned_data['goal'] or 0
										)
		new_tracked_item.save()

		return redirect(reverse('homepage'))

def add_track_entry(request, track_item_id):
	patient = Patient.objects.get(user=request.user)
	tracked_item = TrackedItem.objects.get(id=track_item_id)

	data = {}
	errors = []
	print request.POST
	if not request.POST:
		errors.append('Request must be sent via POST')
		data['errors'] = errors
		return HttpResponse(json.dumps(data), content_type='application/json')
	else:
		new_track_entry = TrackEntry(patient=patient,
										tracked_item=tracked_item,
										severity=request.POST['severity'],
										duration=request.POST['duration'],
										quality=request.POST['quality'],
										quantity=request.POST['quantity'],
										yes_no=request.POST['yes_no'],
										note=request.POST['note'])

		new_track_entry.save()
		data['errors'] = ""
		data['track_entry_id'] = new_track_entry.id
		return HttpResponse(json.dumps(data), content_type='application/json')
