from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin, AbstractUser
from django.db import models
from django.conf import settings
from django.utils import timezone
from events.models import Event


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)

class CustomUser(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=255)  
    is_active = models.BooleanField(default=True)  
    usertype = models.CharField(max_length=50) 
    areas_of_interest = models.JSONField(default=list, blank=True, null=True)    
    joined_date = models.DateTimeField(default=timezone.now) 
    last_login = models.DateTimeField(default=timezone.now)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []  

    class Meta:
        db_table = 'users_customuser'

    def __str__(self):
        return self.email
    

class StudentProfile(models.Model):
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

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='student_profile')
    student_id = models.CharField(max_length=50, unique=True)
    department = models.CharField(max_length=50, choices=DEPARTMENT_CHOICES, default=None)
    admission_year = models.IntegerField(default=2013)
    graduation_year = models.IntegerField()
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)  
    profile_pic = models.ImageField(upload_to='Profile_Picture/Srudent/', blank=True, null=True)  
    skills = models.JSONField(blank=True, null=True) 
    interests = models.JSONField(blank=True, null=True) 
    achievements = models.JSONField(blank=True, null=True)  
    activities = models.JSONField(blank=True, null=True)  
    professional_experiences = models.JSONField(blank=True, null=True)  

    class Meta:
        db_table = 'student_profile'

    def __str__(self):
        return self.user.email
class AlumniProfile(models.Model):
    QUALIFICATION_CHOICES = [
        ('Bachelor', 'Bachelor'),
        ('Master', 'Master'),
        ('Doctorate', 'Doctorate'),
        ('Bachelor_Doctorate', 'Both Bachelor and Doctorate'),
        ('All', 'All (Bachelor, Master, Doctorate)'),
        ('Doctorate_Master', 'Doctorate and Master'),
    ]

    FIELD_OF_STUDY_CHOICES = [
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

    EMPLOYMENT_STATUS_CHOICES = [
        ('Unemployed', 'Unemployed'),
        ('Employed', 'Employed'),
    ]
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='alumni_profile')
    student_id = models.CharField(max_length=50, blank=True, null=True) 
    qualification = models.CharField(max_length=50, choices=QUALIFICATION_CHOICES)
    field_of_study = models.CharField(max_length=100, choices=FIELD_OF_STUDY_CHOICES)
    graduated_year = models.IntegerField()
    employment_status = models.CharField(max_length=50, choices=EMPLOYMENT_STATUS_CHOICES)
    company = models.CharField(max_length=255, blank=True, null=True)
    job_title = models.CharField(max_length=255, blank=True, null=True)
    professional_field = models.CharField(max_length=255, blank=True, null=True)
    work_history = models.JSONField(blank=True, null=True)  
    bio = models.TextField(blank=True, null=True)  
    profile_picture = models.ImageField(upload_to='Profile_Picture/Alumni/', blank=True, null=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    

    class Meta:
        db_table = 'alumni_profile'

    def __str__(self):
        return self.user.email

class StaffProfile(models.Model):
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
    QUALIFICATION_CHOICES = [
        ('Bachelor', 'Bachelor'),
        ('Master', 'Master'),
        ('Doctorate', 'Doctorate'),
        ('Bachelor_Doctorate', 'Both Bachelor and Doctorate'),
        ('All', 'All (Bachelor, Master, Doctorate)'),
        ('Doctorate_Master', 'Doctorate and Master'),
    ]

    
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='staff_profile')
    position = models.CharField(max_length=255)  
    department = models.CharField(max_length=50, choices=DEPARTMENT_CHOICES, default=None)
    qualifications = models.CharField(max_length=50, choices=QUALIFICATION_CHOICES)
    years_of_experience = models.IntegerField() 
    expertise = models.TextField()  
    # areas_of_interest = models.JSONField(blank=True, null=True)
    class Meta:
        db_table = 'staff_profile'

    def __str__(self):
        return self.user.email


class CompanyProfile(models.Model):
    SEMINAR = 'SE'
    INTERNSHIP = 'IN'
    JOB_OPPORTUNITY = 'JO'
    ENGAGEMENT_TYPES = [
        (SEMINAR, 'Seminars'),
        (INTERNSHIP, 'Internships'),
        (JOB_OPPORTUNITY, 'Job Opportunities'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='company_profiles')
    company_name = models.CharField(max_length=255)
    company_address = models.CharField(max_length=255)
    company_city = models.CharField(max_length=255)
    postal_code = models.CharField(max_length=20, blank=True, null=True)
    company_country = models.CharField(max_length=255)
    website_url = models.URLField(blank=True, null=True)
    contact_person_phone_number = models.CharField(max_length=20)
    profile_picture = models.ImageField(upload_to='Profile_Picture/Company/', blank=True, null=True)


    class Meta:
        db_table = 'company_profile'

    def __str__(self):
        return self.name


class Connection(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    )

    requester = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='requested_connections', on_delete=models.CASCADE)
    requestee = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='received_connections', on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('requester', 'requestee')
        db_table = 'connections'

    def __str__(self):
        return f"{self.requester.email} -> {self.requestee.email} [{self.status}]"
    

class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ('new_resource', 'New Resource Shared'),
        ('connect_request', 'New Connection Request'),
        ('connect_accept', 'Connection Accepted'),
        ('event_announcement', 'New Event Announcement'),
        ('new_message', 'New Message'),   
        ('new_opportunity', 'New Opportunity'),     
        ('internship_application_status', 'Internship Application Status'),
        ('job_application_status', 'Job Application Status'),      
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    event = models.ForeignKey(Event, on_delete=models.CASCADE, null=True, blank=True)

    class Meta:
        db_table = 'notification'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.notification_type}"