from rest_framework import serializers
from .models import CustomUser, StudentProfile, AlumniProfile, StaffProfile, CompanyProfile, Connection , Notification
import logging

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = [
            'id',
            'email',
            'full_name',
            'usertype',
            'password',
            'areas_of_interest',
            'last_login'
        ]
        
  
    def validate(self, attrs):
        if not attrs.get('email'):
            raise serializers.ValidationError("Email is required.")
        if not attrs.get('full_name'):
            raise serializers.ValidationError("Full name is required.")
        if not attrs.get('usertype'):
            raise serializers.ValidationError("User type is required.")
        return attrs

    def create(self, validated_data):
        areas_of_interest = validated_data.pop('areas_of_interest', {})
        user = CustomUser(**validated_data)
        user.set_password(validated_data['password']) 
        user.areas_of_interest = areas_of_interest
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
        full_name = attrs['user'].get('full_name', '')
        if ' ' not in full_name:
            raise serializers.ValidationError("Full name must contain a space between first name and last name.")
        
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
        
        
        password = attrs['user'].get('password', '')
        if len(password) < 8 or not any(char.isdigit() for char in password) or \
                not any(char.isalpha() for char in password) or \
                not any(char in '!@#$%^&*()_+[]{}|;:,.<>?/' for char in password):
            raise serializers.ValidationError("Password must be at least 8 characters long and contain at least one letter, one number, and one special character.")

        if errors:
            raise serializers.ValidationError(errors)

        return attrs

    def create(self, validated_data):
        logging.error(f"Error: {validated_data}")
        user_data = validated_data.pop('user')
        user = CustomUser.objects.create_user(**user_data) 
        student_profile = StudentProfile.objects.create(user=user, **validated_data)
        return student_profile
class StudentProfileUpdateSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    class Meta:
        model = StudentProfile
        fields =[
            'user', 
            'student_id',
            'department',
            'admission_year',
            'graduation_year',
            'phone_number',
            'bio', 
            'profile_pic',
            'skills',
            'interests',
            'achievements', 
            'activities',
            'professional_experiences',                        
        ]
    
class AlumniProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    class Meta:
        model = AlumniProfile
        fields = [
            'user', 'student_id', 'qualification', 'field_of_study',
            'graduated_year', 'employment_status', 'company',
            'job_title', 'professional_field', 'phone_number',
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

        # Validation for student_id and graduated_year
        student_id = data.get('student_id', '')
        graduated_year = data.get('graduated_year', None)
        

        if student_id:
            # Extract the admission year from student_id
            try:
                admission_year_suffix = int(student_id.split('/')[-1])  # Get the last part of the student_id
                admission_year = 2000 + admission_year_suffix  # Assuming suffix represents the last two digits of the year
               
            except (IndexError, ValueError):
                raise serializers.ValidationError("Invalid student_id format.")

            # Check if graduated_year is provided
            if graduated_year is None:
                raise serializers.ValidationError("Graduated year must be provided.")

            # Validate graduated_year
            if graduated_year <= admission_year:
                raise serializers.ValidationError("Graduated year must be after the admission year.")

            if graduated_year < admission_year + 4:
                raise serializers.ValidationError("Graduation must be at least 4 years after the admission year.")

        return data


class AlumniProfileUpdateSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    class Meta:
        model = AlumniProfile
        fields = [
            'user',  
            'student_id',
            'qualification',
            'field_of_study',
            'graduated_year',
            'employment_status',
            'company',
            'job_title',
            'professional_field',
            'bio',
            'profile_picture',
            'work_history',
            'phone_number',
        ]
    
    def update(self, instance, validated_data):        
        user = self.context['request'].user   
        if 'user' in validated_data:
            user_data = validated_data.pop('user') 
            if 'areas_of_interest' in user_data:
                user.areas_of_interest = user_data['areas_of_interest']
                user.save()  
        instance = super().update(instance, validated_data)
        return instance


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
            # 'areas_of_interest'
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
            'postal_code',
            'company_country',
            'website_url',
            'contact_person_phone_number',
            'profile_picture',
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

class CompanyUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(required=False, allow_blank=True)
    last_login = serializers.DateTimeField(required=False, allow_null=True)

    class Meta:
        model = CustomUser
        fields = ['email', 'full_name', 'usertype', 'password', 'areas_of_interest', 'last_login']    

class CompanyProfileUpdateSerializer(serializers.ModelSerializer):
    user = CompanyUserSerializer(read_only=True)
    profile_picture = serializers.ImageField(required=False, allow_null=True, allow_empty_file=True)


    class Meta:
        model = CompanyProfile
        fields = [
            'user',
            'company_name',
            'company_address',
            'company_city',
            'postal_code',
            'company_country',
            'website_url',
            'contact_person_phone_number',
            'profile_picture',
        ]
        
class CustomUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ['email', 'full_name', 'password', 'usertype']

    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            email=validated_data['email'],
            full_name=validated_data['full_name'],
            password=validated_data['password'],
            usertype=validated_data['usertype'],
        )
        return user

class UserSearchSerializer(serializers.Serializer):
    full_name = serializers.CharField(required=True)
    department = serializers.CharField(required=True)
    areas_of_interest = serializers.JSONField(required=True)
class MentorSearchSerializer(serializers.ModelSerializer):
    alumni_profile = AlumniProfileSerializer(read_only=True)
    staff_profile = StaffProfileSerializer(read_only=True)
     
    class Meta:
        model = CustomUser
        fields = ['id', 'email','full_name', 'alumni_profile', 'staff_profile']
        
class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'full_name', 'usertype', 'areas_of_interest']
        
        
class ProfileSerializer_Alumni(serializers.ModelSerializer):
    user = UserProfileSerializer()  
    user_id = serializers.IntegerField(source='user.id', read_only=True)

    class Meta:
        model = AlumniProfile
        fields = [
            'user', 
            'user_id', 
            'student_id',
            'qualification',
            'field_of_study',
            'graduated_year',
            'employment_status',
            'company',
            'job_title',
            'professional_field',
            'work_history',
            'bio',
            'profile_picture',
        ]
        
       


class ConnectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Connection
        fields = ['id', 'requester', 'requestee', 'status']
        


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
class NotificationListSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer()
    class Meta:
        model = Notification
        fields = ['id', 'user', 'message', 'created_at','event','is_read']
        read_only_fields = ['created_at', 'is_read']