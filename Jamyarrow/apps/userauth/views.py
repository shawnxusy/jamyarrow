from django.shortcuts import render, redirect
from django.core.urlresolvers import reverse

from userauth.forms import *

def signup(request):
	context = {}

	if request.method == 'GET':
		context['signup_form'] = UserSignupForm()
		return render(request, 'userauth/signup.html', context)
