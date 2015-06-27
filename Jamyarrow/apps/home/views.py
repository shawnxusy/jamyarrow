from django.shortcuts import render

# Homepage
def homepage(request):
    context = {}

    if not request.user.is_authenticated():
    	return render(request, 'home/signup.html', context)

    return render(request, 'home/index.html', context)


def signup(request):
	context = {}

	return render(request, 'home/signup.html', context)