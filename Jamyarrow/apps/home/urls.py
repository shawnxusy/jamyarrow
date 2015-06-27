from django.conf.urls import patterns, url

urlpatterns = patterns('',
    url(r'^$', 'home.views.homepage', name='homepage'),

    # Login/Logout
    url(r'^login$', 'django.contrib.auth.views.login', name='login'),

    url(r'^logout$', 'django.contrib.auth.views.logout', {'next_page': '/'}, name='logout'),

    # Signup
    url(r'^signup$', 'home.views.signup', name='signup'),

)