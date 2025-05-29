
from rest_framework import generics, permissions
from .models import EventMessage , EventParticipant
from .serializers import EventMessageSerializer , EventParticipantSerializer , EventSerializer , AnalyticsSerializer 
from events.models import Event
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from django.db.models import Count
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

import logging
logger = logging.getLogger(__name__)

class EventMessageListCreateView(generics.ListCreateAPIView):
    queryset = EventMessage.objects.all()
    serializer_class = EventMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        event_id = self.kwargs['event_id']
        logging.error(f"Fetching messages for event ID: {event_id}")
        return EventMessage.objects.filter(event_id=event_id)

    def post(self, request, *args, **kwargs):
        logging.error(f"POST request for event ID: {self.kwargs['event_id']}")
        logging.error(f"Request headers: {request.headers}")
        logging.error(f"Request data: {request.data}")
        return super().post(request, *args, **kwargs)

    def perform_create(self, serializer):
        event_id = self.kwargs['event_id']
        logging.error(f"Creating message for event ID: {event_id}, user: {self.request.user}")
        try:
            event = Event.objects.get(id=event_id)
        except Event.DoesNotExist:
            logging.error(f"Event ID {event_id} does not exist")
            return Response(
                {"error": "Event does not exist"},
                status=status.HTTP_404_NOT_FOUND
            )
        if not serializer.is_valid():
            logging.error(f"Serializer errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        # Save with event from URL and sender from payload
        serializer.save(event=event)
        logging.error(f"Message created: {serializer.data}")

class EventParticipantView(generics.ListCreateAPIView):
    queryset = EventParticipant.objects.all()
    serializer_class = EventParticipantSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        event_id = self.kwargs["event_id"]
        return EventParticipant.objects.filter(event_id=event_id)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ParticipantListView(generics.ListAPIView):
    serializer_class = EventParticipantSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        event_id = self.kwargs['event_id']
        # logging.info(f"Fetching participants for event ID: {event_id}")
        return EventParticipant.objects.filter(event_id=event_id)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        logging.debug(f"Participants data: {serializer.data}")
        return Response(serializer.data)
    
class ParticipantStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, event_id):
        # logging.info(f"Checking participant status for user {request.user.full_name} in event ID: {event_id}")
        try:
            participant = EventParticipant.objects.get(event_id=event_id, user=request.user)
            return Response(EventParticipantSerializer(participant).data)
        except EventParticipant.DoesNotExist:
            # logging.info(f"No participant record for user {request.user.full_name} in event ID: {event_id}")
            return Response(
                {"status": "not_joined"},
                status=status.HTTP_200_OK
            )
class EventDetailView(generics.RetrieveAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        logging.info(f"Fetching event ID: {self.kwargs['pk']}")
        return super().get(request, *args, **kwargs)

class EventDetailView(generics.RetrieveAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        logging.info(f"Fetching event ID: {self.kwargs['pk']}")
        return super().get(request, *args, **kwargs)

class JoinEventView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, event_id):
        logging.error(f"Join request for event ID: {event_id} by user: {request.user.full_name}")
        try:
            event = Event.objects.get(id=event_id)
        except Event.DoesNotExist:
            logging.error(f"Event ID {event_id} does not exist")
            return Response(
                {"error": "Event does not exist"},
                status=status.HTTP_404_NOT_FOUND
            )
        # Check if user already requested to join
        if EventParticipant.objects.filter(event=event, user=request.user).exists():
            # logging.warning(f"User {request.user.full_name} already requested to join event ID: {event_id}")
            return Response(
                {"error": "Join request already sent"},
                status=status.HTTP_400_BAD_REQUEST
            )
        # Create join request
        participant = EventParticipant.objects.create(
            event=event,
            user=request.user,
            user_name=request.data.get('user_name', request.user.full_name),  # Full name from frontend
            is_accepted=False
        )
        # logging.info(f"Join request created for user {request.user.full_name} in event ID: {event_id}")
        return Response(
            EventParticipantSerializer(participant).data,
            status=status.HTTP_201_CREATED
        )



class AcceptParticipantView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, participant_id):
        logger.info(f"Admin accepting participant ID: {participant_id}")
        try:
            participant = EventParticipant.objects.get(id=participant_id)
        except EventParticipant.DoesNotExist:
            logger.error(f"Participant ID {participant_id} does not exist")
            return Response(
                {"error": "Participant does not exist"},
                status=status.HTTP_404_NOT_FOUND
            )
        participant.is_accepted = True
        participant.save()
       
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f'event_{participant.event.id}',
            {
                'type': 'event_update',
                'action': 'accepted',
                'sender': 'Admin',
                'message': f'Your join request for {participant.event.title} has been approved',
            }
        )
        return Response(
            EventParticipantSerializer(participant).data,
            status=status.HTTP_200_OK
        )

class DeclineParticipantView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, participant_id):
        logger.info(f"Admin declining participant ID: {participant_id}")
        try:
            participant = EventParticipant.objects.get(id=participant_id)
        except EventParticipant.DoesNotExist:
            logger.error(f"Participant ID {participant_id} does not exist")
            return Response(
                {"error": "Participant does not exist"},
                status=status.HTTP_404_NOT_FOUND
            )
        participant.delete()
        logger.info(f"Participant ID {participant_id} declined and removed")
        # Notify user via WebSocket
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f'event_{participant.event.id}',
            {
                'type': 'event_update',
                'action': 'declined',
                'sender': 'Admin',
                'message': f'Your join request for {participant.event.title} has been declined',
            }
        )
        return Response(
            {"message": "Participant declined"},
            status=status.HTTP_200_OK
        )

class AdminMessageListView(generics.ListAPIView):
    serializer_class = EventMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        event_id = self.kwargs['event_id']
        logger.info(f"Fetching messages for event ID: {event_id}")
        return EventMessage.objects.filter(event_id=event_id)

class AdminMessageDeleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, message_id):
        logger.info(f"Deleting message ID: {message_id}")
        try:
            message = EventMessage.objects.get(id=message_id)
        except EventMessage.DoesNotExist:
            logger.error(f"Message ID {message_id} does not exist")
            return Response(
                {"error": "Message does not exist"},
                status=status.HTTP_404_NOT_FOUND
            )
        message.delete()
        logger.info(f"Message ID {message_id} deleted")
        # Notify via WebSocket
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f'admin_forum_{message.event.id}',
            {
                'type': 'message_deleted',
                'message_id': message_id,
            }
        )
        return Response(
            {"message": "Message deleted"},
            status=status.HTTP_204_NO_CONTENT
        )

class AdminAnalyticsView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request, event_id):
        logger.info(f"Fetching analytics for event ID: {event_id}")
        try:
            event = Event.objects.get(id=event_id)
        except Event.DoesNotExist:
            logger.error(f"Event ID {event_id} does not exist")
            return Response(
                {"error": "Event does not exist"},
                status=status.HTTP_404_NOT_FOUND
            )
        data = {
            'total_messages': EventMessage.objects.filter(event=event).count(),
            'total_participants': EventParticipantSerializer.objects.filter(event=event, is_accepted=True).count(),
            'active_users': EventMessage.objects.filter(event=event).values('sender').distinct().count(),
        }
        return Response(AnalyticsSerializer(data).data)