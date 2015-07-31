from django.conf.urls import patterns, url

urlpatterns = patterns('',
    url(r'^$', 'home.views.homepage', name='homepage'),

    url(r'^add_tracked_item$', 'home.views.add_tracked_item', name='add_tracked_item'),

    url(r'^add_track_entry/(?P<track_item_id>\d+)', 'home.views.add_track_entry', name='add_track_entry'),

    url(r'^edit_quote$', 'home.views.edit_quote', name='edit_quote'),

)
