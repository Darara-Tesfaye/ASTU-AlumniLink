from rest_framework import serializers
from .models import Message, Feedback 
from django.conf import settings
from django.contrib.auth import get_user_model
import logging



class FeedbackSerializers(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = '__all__'  


logger = logging.getLogger(__name__)
User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'full_name']

    def to_representation(self, instance):
        logger.debug(f"Serializing user: id={getattr(instance, 'id', 'N/A')}, type={type(instance)}, value={instance}")
        return super().to_representation(instance)

class FeedbackSerializers(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = '__all__'

class MessageSerializer(serializers.ModelSerializer):
    sender = serializers.SerializerMethodField()
    recipient = serializers.SerializerMethodField()
    media_url = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ['id', 'sender', 'recipient', 'text', 'media', 'media_type', 'media_url','viewed', 'is_edited', 'timestamp']
        read_only_fields = ['id', 'sender', 'recipient', 'media_url', 'timestamp']

    def get_sender(self, obj):
        try:
            user = User.objects.using('default').get(id=obj.sender_id)
            return UserSerializer(user).data
        except User.DoesNotExist:
            logger.error(f"Sender not found: id={obj.sender_id}")
            return None

    def get_recipient(self, obj):
        try:
            user = User.objects.using('default').get(id=obj.recipient_id)
            return UserSerializer(user).data
        except User.DoesNotExist:
            logger.error(f"Recipient not found: id={obj.recipient_id}")
            return None

    def get_media_url(self, obj):
        if obj.media and hasattr(obj.media, 'url'):
            return obj.media.url
        return None

class SendMessageSerializer(serializers.Serializer):
    friend_id = serializers.IntegerField(min_value=1)
    sender_id = serializers.IntegerField(min_value=1)
    text = serializers.CharField(required=False, allow_blank=True, max_length=5000)
    media = serializers.FileField(required=False)
    media_type = serializers.ChoiceField(
        choices=['audio', 'video', 'file'],
        required=False
    )

    def validate(self, data):
        if not (data.get('text') or data.get('media')):
            raise serializers.ValidationError("Either text or media must be provided.")
        if data.get('media') and not data.get('media_type'):
            raise serializers.ValidationError("media_type is required when media is provided.")
        if data.get('media_type') and not data.get('media'):
            raise serializers.ValidationError("media is required when media_type is provided.")
        try:
            User.objects.using('default').get(id=data['sender_id'])
        except User.DoesNotExist:
            raise serializers.ValidationError(f"Sender user not found: id={data['sender_id']}")
        try:
            User.objects.using('default').get(id=data['friend_id'])
        except User.DoesNotExist:
            raise serializers.ValidationError(f"Recipient user not found: id={data['friend_id']}")
        return data

    def validate_media(self, value):
        if value and value.size > 50 * 1024 * 1024:  # 50MB limit
            raise serializers.ValidationError("File size exceeds 50MB.")
        return value

class UpdateMessageSerializer(serializers.Serializer):
    text = serializers.CharField(required=False, allow_blank=True, max_length=5000)
    media = serializers.FileField(required=False)
    media_type = serializers.ChoiceField(
        choices=['audio', 'video', 'file'],
        required=False
    )

    def validate(self, data):
        if not (data.get('text') or data.get('media')):
            raise serializers.ValidationError("Either text or media must be provided.")
        if data.get('media') and not data.get('media_type'):
            raise serializers.ValidationError("media_type is required when media is provided.")
        if data.get('media_type') and not data.get('media'):
            raise serializers.ValidationError("media is required when media_type is provided.")
        return data

    def validate_media(self, value):
        if value and value.size > 50 * 1024 * 1024:
            raise serializers.ValidationError("File size exceeds 50MB.")
        return value

class ViewMessageSerializer(serializers.Serializer):
    message_id = serializers.IntegerField(min_value=1)
    
