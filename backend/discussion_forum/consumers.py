
# import json
# from channels.generic.websocket import AsyncWebsocketConsumer
# from rest_framework_simplejwt.tokens import AccessToken
# from django.contrib.auth.models import User

# class EventForumConsumer(AsyncWebsocketConsumer):
#     async def connect(self):
#         self.room_name = self.scope['url_route']['kwargs']['event_id']
#         self.room_group_name = f"forum_{self.room_name}"

#         await self.channel_layer.group_add(
#             self.room_group_name,
#             self.channel_name
#         )
#         await self.accept()

#     async def disconnect(self, close_code):
#         await self.channel_layer.group_discard(
#             self.room_group_name,
#             self.channel_name
#         )

#     async def receive(self, text_data):
#         data = json.loads(text_data)
#         await self.channel_layer.group_send(
#             self.room_group_name,
#             {
#                 'type': 'forum_message',
#                 'sender': data['sender'],
#                 'message': data['message']
#             }
#         )

#     async def forum_message(self, event):
#         await self.send(text_data=json.dumps({
#             'sender': event['sender'],
#             'message': event['message']
#         }))

# class AdminForumConsumer(AsyncWebsocketConsumer):
#     async def connect(self):
#         self.event_id = self.scope['url_route']['kwargs']['event_id']
#         self.group_name = f'admin_forum_{self.event_id}'
#         await self.channel_layer.group_add(self.group_name, self.channel_name)
#         await self.accept()

#     async def disconnect(self, close_code):
#         await self.channel_layer.group_discard(self.group_name, self.channel_name)
#     async def receive(self, text_data):
#         data = json.loads(text_data)
#         if data['type'] == 'authenticate':
#             try:
#                 token = AccessToken(data['token'])
#                 user = User.objects.get(id=token['user_id'])
#                 if not user.is_staff:
#                     await self.close(code=4001)
#                 self.scope['user'] = user
               
#             except Exception as e:
#                 await self.close(code=4001)

#     async def message_deleted(self, event):
#         await self.send(text_data=json.dumps({
#             'type': 'message_deleted',
#             'message_id': event['message_id'],
#         }))

#     async def event_update(self, event):
#         await self.send(text_data=json.dumps({
#             'type': event['action'],  
#             'message': event['message'],
#             'sender': event['sender'],
#         }))





# discussion_forum/consumers.py
import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth.models import User
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import EventMessage

logger = logging.getLogger(__name__)

class EventForumConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.event_id = self.scope['url_route']['kwargs']['event_id']
        self.room_group_name = f"forum_{self.event_id}"

        # Extract token from query string
        query_string = self.scope.get('query_string', b'').decode()
        token = None
        for param in query_string.split('&'):
            if param.startswith('token='):
                token = param[len('token='):]
                break

        if not token:
            logger.error(f"No token provided for event {self.event_id}")
            await self.close(code=4001)
            return

        try:
            access_token = AccessToken(token)
            user = User.objects.get(id=access_token['user_id'])
            self.scope['user'] = user
            logger.info(f"User {user.username} (ID: {user.id}) connected to WebSocket for event {self.event_id}")
        except Exception as e:
            logger.error(f"Authentication failed for event {self.event_id}: {str(e)}")
            await self.close(code=4001)
            return

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

        # Notify admins that user is online
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f'admin_forum_{self.event_id}',
            {
                'type': 'user_online',
                'user_id': user.id,
            }
        )
        logger.debug(f"Sent user_online for user {user.id} to admin_forum_{self.event_id}")

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        if hasattr(self, 'scope') and 'user' in self.scope:
            user = self.scope['user']
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f'admin_forum_{self.event_id}',
                {
                    'type': 'user_offline',
                    'user_id': user.id,
                }
            )
            logger.debug(f"Sent user_offline for user {user.id} to admin_forum_{self.event_id}")
        logger.info(f"WebSocket disconnected for event {self.event_id}, code: {close_code}")

    async def receive(self, text_data=None, bytes_data=None):
        try:
            if text_data:
                data = json.loads(text_data)
                logger.debug(f"Received WebSocket message: {data}")
                user = self.scope['user']

                if data['type'] == 'user_online':
                    channel_layer = get_channel_layer()
                    async_to_sync(channel_layer.group_send)(
                        f'admin_forum_{self.event_id}',
                        {
                            'type': 'user_online',
                            'user_id': data.get('user_id', user.id),
                        }
                    )
                elif data['type'] == 'user_offline':
                    channel_layer = get_channel_layer()
                    async_to_sync(channel_layer.group_send)(
                        f'admin_forum_{self.event_id}',
                        {
                            'type': 'user_offline',
                            'user_id': data.get('user_id', user.id),
                        }
                    )
                elif data['type'] == 'new_message':
                    message = EventMessage.objects.create(
                        event_id=self.event_id,
                        sender=user,
                        content=data.get('content', '')
                    )
                    await self.channel_layer.group_send(
                        self.room_group_name,
                        {
                            'type': 'forum_message',
                            'message': {
                                'id': message.id,
                                'content': message.content,
                                'created_at': message.created_at.isoformat(),
                            },
                            'sender': user.username,
                        }
                    )
                    logger.debug(f"Sent new_message from {user.username} to forum_{self.event_id}")
            elif bytes_data:
                # Handle audio data
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'audio_broadcast',
                        'audio_data': bytes_data.hex(),  # Convert to hex for JSON compatibility
                        'sender': self.scope['user'].username,
                    }
                )
                logger.debug(f"Broadcasted audio from {self.scope['user'].username} to forum_{self.event_id}")
        except Exception as e:
            logger.error(f"Error processing WebSocket message: {str(e)}")
            await self.send(text_data=json.dumps({'error': 'Invalid message format'}))

    async def forum_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'new_message',
            'message': event['message'],
            'sender': event['sender'],
        }))

    async def audio_broadcast(self, event):
        await self.send(text_data=json.dumps({
            'type': 'audio_broadcast',
            'audio_data': event['audio_data'],
            'sender': event['sender'],
        }))

    async def event_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'event_update',
            'action': event['action'],
            'sender': event['sender'],
            'message': event['message'],
        }))

class AdminForumConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.event_id = self.scope['url_route']['kwargs']['event_id']
        self.group_name = f'admin_forum_{self.event_id}'

        # Extract token from query string
        query_string = self.scope.get('query_string', '')
        token = None
        for param in query_string.split('&'):
            if param.startswith('token='):
                token = param[len('token='):]
                break

        if not token:
            logger.error(f"No token provided for admin event {self.event_id}")
            await self.close(code=4001)
            return

        try:
            access_token = AccessToken(token)
            user = User.objects.get(id=access_token['user_id'])
            if not user.is_staff:
                logger.warning(f"Non-admin user {user.username} attempted to connect to event {self.event_id}")
                await self.close(code=4001)
                return
            self.scope['user'] = user
            logger.info(f"Admin {user.username} (ID: {user.id}) connected to event {self.event_id}")
        except Exception as e:
            logger.error(f"Authentication failed for admin event {self.event_id}: {str(e)}")
            await self.close(code=4001)
            return

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)
        logger.info(f"Admin WebSocket disconnected for event {self.event_id}, code: {close_code}")

    async def receive(self, text_data=None, bytes_data=None):
        try:
            if text_data:
                data = json.loads(text_data)
                logger.debug(f"Admin received message: {data}")
                if data['type'] == 'audio_broadcast':
                    # Broadcast audio to forum group
                    channel_layer = get_channel_layer()
                    async_to_sync(channel_layer.group_send)(
                        f'forum_{self.event_id}',
                        {
                            'type': 'audio_broadcast',
                            'audio_data': data['audio_data'],
                            'sender': self.scope['user'].username,
                        }
                    )
                    logger.debug(f"Admin broadcasted audio to forum_{self.event_id}")
        except Exception as e:
            logger.error(f"Error processing admin message: {str(e)}")
            await self.send(text_data=json.dumps({'error': 'Invalid message format'}))

    async def user_online(self, event):
        await self.send(text_data=json.dumps({
            'type': 'user_online',
            'user_id': event['user_id'],
        }))

    async def user_offline(self, event):
        await self.send(text_data=json.dumps({
            'type': 'user_offline',
            'user_id': event['user_id'],
        }))

    async def message_deleted(self, event):
        await self.send(text_data=json.dumps({
            'type': 'message_deleted',
            'message_id': event['message_id'],
        }))

    async def event_update(self, event):
        await self.send(text_data=json.dumps({
            'type': event['action'],
            'message': event['message'],
            'sender': event['sender'],
        }))