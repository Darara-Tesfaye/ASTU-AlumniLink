from django.conf import settings
from django.db import models


class Event(models.Model):
    EVENT_TYPES = [
        ('online', 'Online'),
        ('In-Person', 'In-Person'),
    ]
    
    PARTICIPANT_TYPES = [
        ('students', 'Students'),
        ('alumni', 'Alumni'),
        ('staff', 'Faculty'),
        ('company', 'Company'),
        ('all', 'All Users'),
    ]
    DEPARTMENT_CHOICES = [
        ('Applied Biology Program', 'Applied Biology Program'),
        ('Applied Chemistry', 'Applied Chemistry'),
        ('Applied Physics', 'Applied Physics'),
        ('Applied Geology', 'Applied Geology'),
        ('Applied Mathematics', 'Applied Mathematics'),
        ('Industrial Chemistry', 'Industrial Chemistry'),
        ('Pharmacy Program', 'Pharmacy Program'),
        ('Computer Science and Engineering', 'Computer Science and Engineering'),
        ('Electronics & Communication Engineering', 'Electronics & Communication Engineering'),
        ('Electrical Power and Control Engineering', 'Electrical Power and Control Engineering'),
        ('Software Engineering', 'Software Engineering'),
        ('Architecture', 'Architecture'),
        ('Civil Engineering', 'Civil Engineering'),
        ('Water Resources Engineering', 'Water Resources Engineering'),
        ('Chemical Engineering', 'Chemical Engineering'),
        ('Material Science and Engineering', 'Material Science and Engineering'),
        ('Mechanical Engineering', 'Mechanical Engineering'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='events_created')
    date_time = models.DateTimeField()
    venue = models.CharField(max_length=255, null=True, blank=True)  
    event_type = models.CharField(max_length=10, choices=EVENT_TYPES)
    participants = models.JSONField(blank=True, null=True) 
    batch = models.CharField(max_length=50, blank=True, null=True)
    department = models.CharField(max_length=50, choices=DEPARTMENT_CHOICES, default=None, null=True)
    is_approved = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'events_table'

    def __str__(self):
        return self.title
    


class Opportunity(models.Model):
    TITLE_CHOICES = (
        ('internship', 'Internship'),
        ('Job', 'Job'),
    )

    title = models.CharField(max_length=255)
    description = models.TextField()
    type = models.CharField(max_length=10, choices=TITLE_CHOICES)
    departments = models.JSONField(blank=True, null=True) 
    batch = models.CharField(max_length=10, blank=True, null=True)  
    area = models.CharField(max_length=255, blank=True, null=True)
    start_date = models.DateField(blank=True, default=None, null=True)
    end_date = models.DateField(blank=True, null=True, default=None)
    experience_years = models.IntegerField(blank=True, null=True)  
    field_of_study = models.CharField(max_length=255, blank=True, null=True) 
    created_on = models.DateTimeField(auto_now_add=True) 
    is_approved = models.BooleanField(default=False)  
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='opportunities_created')
    salary = models.CharField(max_length=255, blank=True, null=True)
    class Meta:
        db_table = 'opportunities_table'

    def __str__(self):
        return self.title

class InternshipApplication(models.Model):
    student_id = models.CharField(max_length=100)  
    student_name = models.CharField(max_length=255) 
    department = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=20, blank=True, null=True)  
    achievements = models.TextField(blank=True, null=True) 
    professional_experiences = models.TextField(blank=True, null=True)  
    skills = models.JSONField(blank=True, null=True) 
    cover_letter = models.TextField(blank=True, null=True)  
    status = models.CharField(max_length=10, choices=[('accepted', 'Accepted'), ('declined', 'Declined'), ('pending', 'Pending')], default='pending')  # Optional field
    created_on = models.DateTimeField(auto_now_add=True)      
    internship = models.ForeignKey(Opportunity, on_delete=models.CASCADE)

    class Meta:
        db_table= 'internship_application_table'

    def __str__(self):
        return f"{self.student_name} - {self.student_id} - {self.department}"
    
class JobApplication(models.Model):
    job = models.ForeignKey('Opportunity', on_delete=models.CASCADE)
    alumni_id = models.CharField(max_length=100)
    alumni_name = models.CharField(max_length=255)
    field_of_study = models.CharField(max_length=255)
    cover_letter = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=10, choices=[
        ('accepted', 'Accepted'), 
        ('declined', 'Declined'), 
        ('pending', 'Pending')
    ], default='pending')
    created_on = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'job_application_table'

    def __str__(self):
        return f"{self.alumni_name} - {self.alumni_id}"


class ResourceShare(models.Model):
    DEPARTMENT_CHOICES = [
        ('Applied Biology Program', 'Applied Biology Program'),
        ('Applied Chemistry', 'Applied Chemistry'),
        ('Applied Physics', 'Applied Physics'),
        ('Applied Geology', 'Applied Geology'),
        ('Applied Mathematics', 'Applied Mathematics'),
        ('Industrial Chemistry', 'Industrial Chemistry'),
        ('Pharmacy Program', 'Pharmacy Program'),
        ('Computer Science and Engineering', 'Computer Science and Engineering'),
        ('Electronics & Communication Engineering', 'Electronics & Communication Engineering'),
        ('Electrical Power and Control Engineering', 'Electrical Power and Control Engineering'),
        ('Software Engineering', 'Software Engineering'),
        ('Architecture', 'Architecture'),
        ('Civil Engineering', 'Civil Engineering'),
        ('Water Resources Engineering', 'Water Resources Engineering'),
        ('Chemical Engineering', 'Chemical Engineering'),
        ('Material Science and Engineering', 'Material Science and Engineering'),
        ('Mechanical Engineering', 'Mechanical Engineering'),
    ]

    RESOURCE_TYPE_CHOICES = [
            ('text', 'Text'),
            ('book', 'Book'),
            ('ppt', 'PowerPoint'),
            ('file', 'File'),
            ('url', 'URL'),
        ]

    staff = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='resource_shares')
    department = models.CharField(max_length=50, choices=DEPARTMENT_CHOICES)
    batch = models.CharField(max_length=50) 
    course = models.CharField(max_length=100)  
    resource_type = models.CharField(max_length=10, choices=RESOURCE_TYPE_CHOICES)
    title = models.CharField(max_length=255)  
    description = models.TextField(blank=True, null=True)  
    file = models.FileField(upload_to='resources/', blank=True, null=True)  
    url = models.URLField(blank=True, null=True)  
    created_on = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'resource_share_table'

    def __str__(self):
        return f"{self.title} - {self.department} ({self.batch})"