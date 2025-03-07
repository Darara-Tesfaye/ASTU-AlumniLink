from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin, AbstractUser
from django.db import models
from django.conf import settings
from django.utils import timezone


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
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        return self.create_user(email, password, **extra_fields)

class CustomUser(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=255)  
    is_active = models.BooleanField(default=True)  
    usertype = models.CharField(max_length=50) 
    joined_date = models.DateTimeField(default=timezone.now) 
    last_login = models.DateTimeField(default=timezone.now)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []  

    class Meta:
        db_table = 'users_customuser'

    def __str__(self):
        return self.email
    
# class SearchCustomUser(AbstractUser):
#     USER_TYPE_CHOICES = [
#         ('student', 'Student'),
#         ('teacher', 'Teacher'),
#         ('admin', 'Admin'),
#     ]
#     user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES)
#     email = models.EmailField(unique=True)

#     @property
#     def full_name(self):
#         return f"{self.first_name} {self.last_name}"

#     def __str__(self):
#         return self.username

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
    areas_of_interest = models.JSONField(default=list)  

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

    class Meta:
        db_table = 'company_profile'

    def __str__(self):
        return self.name
