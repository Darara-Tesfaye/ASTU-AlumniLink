from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/discussion_forum/forum/event/(?P<event_id>\d+)/$', consumers.EventForumConsumer.as_asgi()),
    re_path(r'ws/discussion_forum/admin/forum/(?P<event_id>\d+)/$', consumers.AdminForumConsumer.as_asgi()),
]

# This file defines the WebSocket routing for the discussion forum application.
# It maps WebSocket connections to the `EventForumConsumer` for handling events related to discussion forums.