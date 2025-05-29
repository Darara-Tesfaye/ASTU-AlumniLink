from rest_framework import serializers
from .models import EventMessage, EventParticipant
from events.models import Event

class EventParticipantSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source="user.full_name")

    class Meta:
        model = EventParticipant
        fields = ["event", "user_name", "joined_at"]
        
class EventMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventMessage
        fields = ['id', 'content', 'created_at', 'sender']
        read_only_fields = ['id', 'created_at']
        
        
class EventParticipantSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField() 
    joined_at = serializers.DateTimeField(read_only=True)
    is_accepted = serializers.BooleanField(read_only=True)

    class Meta:
        model = EventParticipant
        fields = ['id', 'user_id', 'user_name', 'joined_at', 'is_accepted']
        read_only_fields = ['id', 'user_id', 'joined_at', 'is_accepted']
        
        
class EventSerializer(serializers.ModelSerializer):
    event_participants = EventParticipantSerializer(many=True, read_only=True)

    class Meta:
        model = Event
        fields = ['id', 'title', 'description', 'date_time', 'event_participants']


class AnalyticsSerializer(serializers.Serializer):
    total_messages = serializers.IntegerField()
    total_participants = serializers.IntegerField()
    active_users = serializers.IntegerField()