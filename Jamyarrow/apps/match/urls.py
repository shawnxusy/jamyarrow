from django.conf.urls import patterns, url

urlpatterns = patterns('',
    url(r'^$', 'match.views.match', name='match'),
    url(r'^save_settings$','match.views.save_settings', name="save_settings"),
    url(r'^view_timeline/(?P<user_id>\d+)$', 'match.views.view_timeline', name="view_timeline"),
    url(r'^reset_privacy$', 'match.views.reset_privacy', name="reset_privacy"),
    url(r'^match_strict$', 'match.views.match_strict', name="match_strict"),
)
