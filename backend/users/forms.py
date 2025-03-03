# forms.py
from django import forms
from .models import StudentProfile, AlumniProfile, StaffProfile

class StudentProfileForm(forms.ModelForm):
    class Meta:
        model = StudentProfile
        fields = ['student_id', 'department', 'admission_year', 'graduation_year', 'phone_number']

class AlumniProfileForm(forms.ModelForm):
    class Meta:
        model = AlumniProfile
        fields = ['student_id', 'qualification', 'field_of_study', 
                  'graduated_year', 'employment_status', 'company', 
                  'job_title', 'professional_field', 'areas_of_interest']

class StaffProfileForm(forms.ModelForm):
    class Meta:
        model = StaffProfile
        fields = ['position', 'department', 'qualifications', 
                  'years_of_experience', 'expertise']