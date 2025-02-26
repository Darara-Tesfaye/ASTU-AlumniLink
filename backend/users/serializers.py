from rest_framework import serializers
from .models import CustomUser, StudentProfile, AlumniProfile, StaffProfile, CompanyProfile
import logging

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = [
            'email',
            'full_name',
            'usertype',
            'password',
            # 'confirm_password',
        ]

    def validate(self, attrs):
        return attrs

    def create(self, validated_data):
        user = CustomUser(**validated_data)
        user.set_password(validated_data['password']) 
        user.save()
        return user
class StudentProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = StudentProfile
        fields = [
            'user',  
            'student_id',
            'department',
            'admission_year',
            'graduation_year',
            'phone_number',
        ]

    def validate(self, attrs):
        errors = {}
        user_data = attrs.pop('user')
        attrs['user'] = user_data

        if attrs['graduation_year'] < attrs['admission_year']:
            errors["graduation_year"] = "Graduation year must be after admission year."
        
        year_gap = attrs['graduation_year'] - attrs['admission_year']
        if year_gap < 4:
            errors["graduation_year"] = "The minimum required years to complete the department is 4."
        if year_gap > 7:
            errors["graduation_year"] = "The maximum allowed difference between admission and graduation year is 7 years."

        admission_year_last_two_digits = str(attrs['admission_year'])[-2:]
        student_id_last_two_digits = attrs['student_id'].split('/')[-1]  
        if student_id_last_two_digits != admission_year_last_two_digits:
            errors["student_id"] = "Fill admission year by Ethiopian C."

        if errors:
            raise serializers.ValidationError(errors)

        return attrs

    def create(self, validated_data):
        logging.error(f"Error: {validated_data}")
        user_data = validated_data.pop('user')
        user = CustomUser.objects.create_user(**user_data) 
        student_profile = StudentProfile.objects.create(user=user, **validated_data)
        return student_profile
    
class AlumniProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = AlumniProfile
        fields = [
            'user', 'student_id', 'qualification', 'field_of_study',
            'graduated_year', 'employment_status', 'company',
            'job_title', 'professional_field', 'areas_of_interest'
        ]

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        user = UserSerializer.create(UserSerializer(), validated_data=user_data)  # Create user
        alumni_profile = AlumniProfile.objects.create(user=user, **validated_data)
        return alumni_profile

    def validate(self, data):
        full_name = data['user'].get('full_name', '')
        if ' ' not in full_name:
            raise serializers.ValidationError("Full name must contain a space between first name and last name.")

        password = data['user'].get('password', '')
        if len(password) < 8 or not any(char.isdigit() for char in password) or \
                not any(char.isalpha() for char in password) or \
                not any(char in '!@#$%^&*()_+[]{}|;:,.<>?/' for char in password):
            raise serializers.ValidationError("Password must be at least 8 characters long and contain at least one letter, one number, and one special character.")

        if data.get('employment_status') == 'Unemployed':
            if data.get('company') or data.get('job_title'):
                raise serializers.ValidationError("If unemployed, company and job title must not be filled.")

        return data

class StaffProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = StaffProfile
        fields = [
            'user',  
            'position', 
            'department', 
            'qualifications', 
            'years_of_experience', 
            'expertise', 
        ]

    def validate(self, attrs):
        user_data = attrs.pop('user')
        attrs['user'] = user_data  
        return attrs

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        user = CustomUser.objects.create_user(**user_data)  # Create the user
        staff_profile = StaffProfile.objects.create(user=user, **validated_data)
        return staff_profile
    
 
class CompanyProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = CompanyProfile
        fields = [
            'user',
            'company_name',
            'company_address',
            'company_city',
            # 'state_or_region',
            'postal_code',
            'company_country',
            'website_url',
            'contact_person_phone_number',
        ]

    def validate(self, attrs):
        user_data = attrs.pop('user')
        attrs['user'] = user_data  
        return attrs

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        user = CustomUser.objects.create_user(**user_data)  
        company_profile = CompanyProfile.objects.create(user=user, **validated_data)
        return company_profile