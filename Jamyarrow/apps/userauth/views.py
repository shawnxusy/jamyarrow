from django.shortcuts import render, redirect
from django.core.urlresolvers import reverse
from django.contrib.auth import authenticate, login

from userauth.forms import *
from core.models import *

def signup(request):
	context = {}

	if request.method == 'GET':
		context['signup_form'] = UserSignupForm()
		return render(request, 'userauth/signup.html', context)

	else:
		user_signup_form = UserSignupForm(request.POST)
		context['signup_form'] = user_signup_form
		if not user_signup_form.is_valid():
			return render(request, 'userauth/signup.html', context)

		new_user = User.objects.create_user(
			username=user_signup_form.cleaned_data['username'],
			email=user_signup_form.cleaned_data['email'],
			password=user_signup_form.cleaned_data['password1'])

		new_user.save()

		# Mark the mealuser as inactive
		new_patient = Patient(user=new_user,
							name=user_signup_form.cleaned_data['name'],
							phone=user_signup_form.cleaned_data['phone'],
							cancer_type=user_signup_form.cleaned_data['cancer_type'],
							cancer_stage=user_signup_form.cleaned_data['cancer_stage'])
		new_patient.save()

		new_user.backend = 'django.contrib.auth.backends.ModelBackend'
		login(request, new_user)

		return redirect(reverse('homepage'))