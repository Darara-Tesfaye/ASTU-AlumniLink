from django.urls import path
from .views import EventMessageListCreateView ,EventParticipantView , EventDetailView, JoinEventView, ParticipantStatusView, ParticipantListView, AdminMessageListView ,AcceptParticipantView, AdminAnalyticsView, DeclineParticipantView ,AdminMessageDeleteView

urlpatterns = [
    path("forum/event/<int:event_id>/messages/", EventMessageListCreateView.as_view(), name="event-messages"),
    path("forum/event/<int:event_id>/participants/", EventParticipantView.as_view(), name="event-participants"),
    path('events/<int:pk>/', EventDetailView.as_view(), name='event-detail'),
    path('events/<int:event_id>/join/', JoinEventView.as_view(), name='join-event'),
    path('events/<int:event_id>/status/', ParticipantStatusView.as_view(), name='participant-status'),
    path('events/<int:event_id>/participants/', ParticipantListView.as_view(), name='participant-list'),
    path('admin/forum/event/<int:event_id>/messages/', AdminMessageListView.as_view(), name='admin-message-list'),
    path('admin/forum/messages/<int:message_id>/', AdminMessageDeleteView.as_view(), name='admin-message-delete'),
    path('admin/forum/event/<int:event_id>/analytics/', AdminAnalyticsView.as_view(), name='admin-analytics'),
    path('participants/<int:participant_id>/accept/', AcceptParticipantView.as_view(), name='accept-participant'),
    path('participants/<int:participant_id>/decline/', DeclineParticipantView.as_view(), name='decline-participant'),
]
 