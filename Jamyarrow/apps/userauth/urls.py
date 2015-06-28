from django.conf.urls import patterns, url
from userauth.forms import LoginForm

urlpatterns = patterns('',
	# Login/Logout
	url(r'^login$', 'django.contrib.auth.views.login', {'template_name':'userauth/login.html', 'authentication_form':LoginForm}, name='login'),

	url(r'^logout$', 'django.contrib.auth.views.logout', {'next_page': '/'}, name='logout'),

	# Signup
	url(r'^signup$', 'userauth.views.signup', name='signup'),

)