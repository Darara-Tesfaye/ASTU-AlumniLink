from .models import Notification
import logging

def create_notification(user, notification_type, message, event=None):
    try:
        Notification.objects.create(
            user=user,
            notification_type=notification_type,
            message=message,
            event=event 
        )
        logging.error(f"Notification created for user : {message}")
    except Exception as e:
        logging.error(f"Failed to create notification: {str(e)}")