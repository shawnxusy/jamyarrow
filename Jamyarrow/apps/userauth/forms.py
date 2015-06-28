from django import forms
from django.contrib.auth.forms import AuthenticationForm
# from django.contrib.auth.forms import AuthenticationForm
from django.forms.widgets import TextInput, EmailInput, PasswordInput, Textarea
from core.models import *
from django.forms.models import *

import re

class LoginForm(AuthenticationForm):
  username = forms.CharField(widget=TextInput(
	attrs={'class': 'form-control','placeholder': 'Username', 'required':'', 'autofocus':''}))
  password = forms.CharField(widget=PasswordInput(
	attrs={'class': 'form-control','placeholder':'Password', 'required':''}))


class UserSignupForm(forms.Form):
	username = forms.CharField(max_length=50, widget=TextInput(
		attrs={'placeholder': 'Pick a username', 'required': '', 'autofocus': ''}))
	name = forms.CharField(max_length=50, widget=TextInput(
		attrs={'placeholder': 'Your name', 'required': ''}))
	email = forms.CharField(max_length=50, widget=EmailInput(
		attrs={'placeholder': 'Email Address', 'required': ''}))
	password1 = forms.CharField(label='Password', widget=PasswordInput(
		attrs={'class': 'form-control', 'placeholder': 'Create your password', 'required': ''}))
	password2 = forms.CharField(label='Confirm password', widget=PasswordInput(
		attrs={'class': 'form-control', 'placeholder': 'Confirm your password', 'required': ''}))
	phone = forms.CharField(max_length=20, widget=TextInput(
		attrs={'placeholder': '(###) ###-####', 'class': 'form-control', 'required': ''}))

	cancer_type = forms.ChoiceField(choices=Patient.CANCER_TYPES)
	cancer_stage = forms.IntegerField(max_value=4)
	

	def clean(self):
		# Calls our parent (forms.Form) .clean function, gets a dictionary
		# of cleaned data as a result
		cleaned_data = super(UserSignupForm, self).clean()

		# Confirms that the two password fields match
		password1 = cleaned_data.get('password1')
		password2 = cleaned_data.get('password2')
		if password1 and password2 and password1 != password2:
			raise forms.ValidationError("Passwords did not match.")

		# Generally return the cleaned data we got from our parent.
		return cleaned_data

	def clean_username(self):
		username = self.cleaned_data.get('username')
		if User.objects.filter(username__exact=username):
			raise forms.ValidationError("Username is already taken.")
		if re.search(r'[^-\'\w\.]', username):
			raise forms.ValidationError("Username can only contain numbers, letters, \'-\', \'.\' and \'.")
		if re.search(r'\.{2,}', username):
			raise forms.ValidationError("Username cannot contain consecutive \'.\'.")

		# Generally return the cleaned data we got from our parent.
		return username

	def clean_email(self):
		email = self.cleaned_data.get('email')
	
		if len(User.objects.filter(email__iexact=email)) > 0:
			raise forms.ValidationError('Email is already registered.')
		return email