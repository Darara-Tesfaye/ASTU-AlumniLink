
from rest_framework import serializers
from .models import Event, Opportunity, InternshipApplication, JobApplication , ResourceShare
from users.serializers import CompanyProfileSerializer , StaffProfileSerializer
from users.models import CompanyProfile , StaffProfile

class EventSerializer(serializers.ModelSerializer):
    company_profile = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            'id',
            'title',
            'description',
            'date_time',
            'venue',
            'event_type',
            'participants',
            'batch',
            'department',
            'is_approved',
            'created_by',
            'company_profile',
        ]
        read_only_fields = ['created_by', 'is_approved']

    def get_company_profile(self, obj):
        try:
            company_profile = CompanyProfile.objects.get(user=obj.created_by)
            return CompanyProfileSerializer(company_profile).data  
        except CompanyProfile.DoesNotExist:
            return None  

class OpportunitySerializer(serializers.ModelSerializer):
    company_profile = serializers.SerializerMethodField()
    class Meta:
        model = Opportunity
        fields = [
            'id',
            'title',
            'description',
            'type',
            'departments',
            'batch',
            'area',
            'start_date',
            'end_date',
            'experience_years',
            'field_of_study',
            'created_on',
            'is_approved',
            'created_by',
            'salary',
            'company_profile',  
        ]
    
    def get_company_profile(self, obj):
        try:
            company_profile = CompanyProfile.objects.get(user=obj.created_by)
            return CompanyProfileSerializer(company_profile).data  
        except CompanyProfile.DoesNotExist:
            return None 
        
    def validate(self, data):
        """
        Custom validation to enforce start_date and end_date requirements
        based on the opportunity type.
        """
        opportunity_type = data.get('type')
        start_date = data.get('start_date')
        end_date = data.get('end_date')

        if opportunity_type == 'internship':
            if not start_date:
                raise serializers.ValidationError({
                    'start_date': 'This field is required for internships.'
                })
            if not end_date:
                raise serializers.ValidationError({
                    'end_date': 'This field is required for internships.'
                })
       
        return data

class InternshipOpportunitySerializer(OpportunitySerializer):
    company_profile = serializers.SerializerMethodField()
    class Meta:
        model = Opportunity
        fields = [
            'id',
            'title',
            'description',
            'type',
            'departments',
            'batch',
            'area',
            'start_date',
            'end_date',
            'created_on',
            'is_approved',
            'created_by',
            'salary',
            'company_profile',
        ]
    def get_company_profile(self, obj):
        try:
            company_profile = CompanyProfile.objects.get(user=obj.created_by)
            return CompanyProfileSerializer(company_profile).data  
        except CompanyProfile.DoesNotExist:
            return None 
        
class InternshipApplicationSerializer(serializers.ModelSerializer):
    internships = serializers.SerializerMethodField()
    class Meta:
        model = InternshipApplication
        fields = [
            'id',
            'internships',
            'student_id',
            'student_name',
            'department',
            'phone_number',
            'achievements',
            'professional_experiences',
            'skills',
            'cover_letter',
            'status',
            'created_on',            
            'internship',
        ]
        read_only_fields = ['created_on']
    def get_internships(self, obj):
        try:
            internship = Opportunity.objects.get(id=obj.internship.id)
            return InternshipOpportunitySerializer(internship).data  
        except Opportunity.DoesNotExist:
            return None
    
class JobOpportunitySerializer(OpportunitySerializer):
    class Meta:
        model = Opportunity
        fields = [
            'id',
            'title',
            'description',
            'type',
            'field_of_study',
            'created_on',
            'is_approved',
            'created_by',
            'salary',
            'company_profile',
        ]
class JobApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobApplication
        fields = [
            'id',
            'job',
            'alumni_id',
            'alumni_name',
            'field_of_study',
            'cover_letter',
            'status',
            'created_on',
        ]
        read_only_fields = ['created_on']
        
class JobApplicationListSerializer(serializers.ModelSerializer):
    job = JobOpportunitySerializer()
    class Meta:
        model = JobApplication
        fields = [
            'id',
            'job',
            'alumni_id',
            'alumni_name',
            'field_of_study',
            'cover_letter',
            'status',
            'created_on',
        ]
        read_only_fields = ['created_on']
        
        
class ResourceShareSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResourceShare
        fields = ['staff','department', 'batch', 'course', 'resource_type', 'title', 'description', 'file', 'url']
        
class ResourceShareAccessSerializer(serializers.ModelSerializer):
    StaffProfile = serializers.SerializerMethodField()
    def get_StaffProfile(self, obj):
        try:
            staff_profile = StaffProfile.objects.get(user=obj.staff)
            return StaffProfileSerializer(staff_profile).data  
        except StaffProfile.DoesNotExist:
            return None
    
    class Meta:
        model = ResourceShare
        fields = ['staff', 'department', 'batch', 'course', 'resource_type', 'title', 'description', 'file', 'url', 'StaffProfile', 'created_on']