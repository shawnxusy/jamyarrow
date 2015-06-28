from django.shortcuts import render, redirect
from django.core.urlresolvers import reverse

# Homepage
def homepage(request):
	context = {}

	if not request.user.is_authenticated():
		return redirect(reverse('login'))

	return render(request, 'home/index.html', context)