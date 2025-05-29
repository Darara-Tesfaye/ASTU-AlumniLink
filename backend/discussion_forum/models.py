from django.db import models
from django.conf import settings
from events.models import Event
from django.contrib.auth import get_user_model
User = get_user_model()

class DiscussionForum(models.Model):
    event = models.ForeignKey(
        'events.Event',  
        on_delete=models.CASCADE,
        related_name='forums',
        db_constraint=False
    )
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'discussion_forum'  

class EventMessage(models.Model):
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="messages")
    sender = models.CharField(max_length=255, default='Anonymous')

    class Meta:
        db_table = 'event_message'

class EventParticipant(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='event_participants')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='participated_events')
    user_name = models.CharField(max_length=255)  
    joined_at = models.DateTimeField(auto_now_add=True)
    is_accepted = models.BooleanField(default=False) 
    class Meta:
        db_table = 'event_participant'
        unique_together = ('event', 'user')  

    def __str__(self):
        return f"{self.user_name} - {self.event.title}"