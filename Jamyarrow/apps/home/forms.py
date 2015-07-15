from django import forms
from django.contrib.auth.forms import AuthenticationForm
# from django.contrib.auth.forms import AuthenticationForm
from django.forms.widgets import TextInput, CheckboxSelectMultiple
from core.models import *
from django.forms.models import *

import re

class AddTrackedItemForm(forms.ModelForm):
    class Meta:
        model = TrackedItem
        fields = ['name', 'category', 'severity', 'duration', 'quality', 'quantity', 'yes_no', 'goal']
        widgets = {'name': TextInput(attrs={'style': 'text-transform:lowercase;'})}

class AddTrackEntryForm(forms.ModelForm):
    class Meta:
        model = TrackEntry
        fields = ['severity', 'duration', 'quality', 'quantity', 'yes_no', 'note']
