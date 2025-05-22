from django.db import models
from django.core.exceptions import ValidationError
from django.conf import settings


class Feedback(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField()
    subject = models.CharField(max_length=255)
    message = models.TextField()
    affiliation = models.CharField(max_length=50)

    def __str__(self):
        return self.name
    def save(self, *args, **kwargs):
        if Feedback.objects.filter(name=self.name, email=self.email, subject=self.subject, message=self.message).exists():
            raise ValidationError('This feedback has already been submitted.')
        super(Feedback, self).save(*args, **kwargs)


class Message(models.Model):
    sender_id = models.IntegerField()  
    recipient_id = models.IntegerField() 
    text = models.TextField(blank=True, null=True)
    media = models.FileField(upload_to='messages/', blank=True, null=True)
    media_type = models.CharField(
        max_length=10,
        choices=[('audio', 'Audio'), ('video', 'Video'), ('file', 'File')],
        blank=True,
        null=True
    )
    timestamp = models.DateTimeField(auto_now_add=True)
    is_edited = models.BooleanField(default=False)  
    viewed = models.BooleanField(default=False)

    class Meta:
        db_table = 'contactapp_message'
        
