import logging
from .models import Notification

def create_notification(user, notification_type, message, event=None, db_alias='default'):
    try:
        notification = Notification.objects.using(db_alias).create(
            user=user,
            notification_type=notification_type,
            message=message,
            event=event
        )
        logging.info(f"Notification created for user in {db_alias} database: {message}")
        return notification
    except Exception as e:
        logging.error(f"Failed to create notification in {db_alias} database: {str(e)}")
        return None