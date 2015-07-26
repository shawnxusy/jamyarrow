from django.conf.urls import patterns, url

urlpatterns = patterns('',
    url(r'^$', 'match.views.match', name='match'),
    url(r'^save_settings$','match.views.save_settings', name="save_settings"),
    url(r'^view_timeline/(?P<user_id>\d+)$', 'match.views.view_timeline', name="view_timeline"),
)
