from django.conf.urls import patterns, url

urlpatterns = patterns('',
    url(r'^$', 'timeline.views.timeline', name='timeline'),
    url(r'^add_event$','timeline.views.add_event', name="add_event"),
    url(r'^edit_event$','timeline.views.edit_event', name="edit_event"),
    url(r'^delete_event$','timeline.views.delete_event', name="delete_event"),
)
