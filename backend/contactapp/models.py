from django.db import models
from django.core.exceptions import ValidationError


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