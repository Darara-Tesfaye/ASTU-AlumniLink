from django.shortcuts import render
from rest_framework import generics
from .models import Feedback, Message
from .serializers import FeedbackSerializers, MessageSerializer, SendMessageSerializer, UpdateMessageSerializer
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from django.db.models import Q
from django.db import transaction
import logging, os
from users.notifications import create_notification

logger = logging.getLogger(__name__)
User = get_user_model()

class FeedbackCreateView(generics.CreateAPIView):
    queryset = Feedback.objects.all()
    serializer_class = FeedbackSerializers
    permission_classes = [AllowAny]

class SendMediaMessageView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = SendMessageSerializer(data=request.data)
        if serializer.is_valid():
            friend_id = serializer.validated_data['friend_id']
            sender_id = serializer.validated_data['sender_id']
            text = serializer.validated_data.get('text')
            media = serializer.validated_data.get('media')
            media_type = serializer.validated_data.get('media_type')

            if sender_id != request.user.id:
                return Response(
                    {'error': 'Sender ID does not match authenticated user'},
                    status=status.HTTP_403_FORBIDDEN
                )

            try:
                message = Message.objects.using('secondary').create(
                    sender_id=sender_id,
                    recipient_id=friend_id,
                    text=text,
                    media=media,
                    media_type=media_type
                )
                recipient_user = User.objects.get(id=friend_id)
                create_notification(
                    user=recipient_user,
                    notification_type='new_message',  
                    message=f"You have a new message from {request.user.full_name}",
                )
                return Response(
                    {
                        'success': True,
                        'message_id': message.id,
                        'message': MessageSerializer(message).data
                    },
                    status=status.HTTP_201_CREATED
                )
            except Exception as e:
                return Response(
                    {'error': f'Failed to create message: {str(e)}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class GetMessagesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, friend_id):

        try:
            User.objects.using('default').get(id=friend_id)
        except User.DoesNotExist:
            return Response(
                {'error': 'Friend not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except ValueError:
            return Response(
                {'error': 'Invalid friend_id format'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            messages = Message.objects.using('secondary').filter(
                Q(sender_id=request.user.id, recipient_id=friend_id) |
                Q(sender_id=friend_id, recipient_id=request.user.id)
            ).order_by('timestamp')

            return Response(MessageSerializer(messages, many=True).data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'error': f'Failed to retrieve messages: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
class UpdateMessageView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, message_id):
        logging.debug(f"Updating message: message_id={message_id}, user_id={request.user.id}")

        try:
            message = Message.objects.using('secondary').get(id=message_id)
        except Message.DoesNotExist:
            logging.error(f"Message not found: id={message_id}")
            return Response(
                {'error': 'Message not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if message.sender_id != request.user.id:
            logging.warning(f"Unauthorized update attempt: user_id={request.user.id}, message_id={message_id}")
            return Response(
                {'error': 'Only the sender can update this message'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = UpdateMessageSerializer(data=request.data)
        if serializer.is_valid():
            try:
                with transaction.atomic(using='secondary'):
                    # Update fields without changing timestamp
                    update_fields = []
                    if 'text' in serializer.validated_data:
                        message.text = serializer.validated_data['text']
                        update_fields.append('text')
                    if 'media' in serializer.validated_data:
                        message.media = serializer.validated_data['media']
                        update_fields.append('media')
                    if 'media_type' in serializer.validated_data:
                        message.media_type = serializer.validated_data['media_type']
                        update_fields.append('media_type')
                    message.is_edited = True
                    update_fields.append('is_edited')
                    message.save(update_fields=update_fields)
                    logging.info(f"Message updated: id={message.id}, by user={request.user.id}, fields={update_fields}")
                    serialized = MessageSerializer(message).data
                    logging.debug(f"Serialized updated message: {serialized}")
                return Response(
                    {
                        'success': True,
                        'message': serialized
                    },
                    status=status.HTTP_200_OK
                )
            except Exception as e:
                logging.error(f"Error updating message: {str(e)}")
                return Response(
                    {'error': f'Failed to update message: {str(e)}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

        logging.warning(f"Invalid update data: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DeleteMessageView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, message_id):

        try:
            message = Message.objects.using('secondary').get(id=message_id)
        except Message.DoesNotExist:
            return Response(
                {'error': 'Message not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if message.sender_id != request.user.id and message.recipient_id != request.user.id:
            return Response(
                {'error': 'You are not authorized to delete this message'},
                status=status.HTTP_403_FORBIDDEN
            )

        
        with transaction.atomic(using='secondary'):
            if message.media and message.media.path:
                media_path = message.media.path
                if os.path.exists(media_path):
                    os.remove(media_path)
                        
                else:
                    logging.warning(f"Media file not found: path={media_path}")

            
            message.delete()
        return Response(
            {'success': True, 'message': 'Message and associated media deleted'},
            status=status.HTTP_200_OK
        )
       

class MarkMessageViewedView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        message_id = request.data.get('message_id')
        if not message_id:
            return Response(
                {'error': 'Message ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            message = Message.objects.using('secondary').get(id=message_id)
        except Message.DoesNotExist:
            return Response(
                {'error': 'Message not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if message.recipient_id != request.user.id:
            return Response(
                {'error': 'You are not authorized to mark this message as viewed'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            with transaction.atomic(using='secondary'):
                message.viewed = True
                message.save(using='secondary')
            return Response(
                {'success': True, 'message': 'Message marked as viewed'},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
