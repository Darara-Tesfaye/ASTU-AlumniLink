from rest_framework import generics, status, viewsets, permissions
from rest_framework.response import Response
from .models import StudentProfile, AlumniProfile, StaffProfile, CompanyProfile, CustomUser , Connection , Notification
from .serializers import StudentProfileSerializer, AlumniProfileSerializer,ProfileSerializer_Alumni ,StaffProfileSerializer, CompanyProfileSerializer , UserSerializer, MentorSearchSerializer, AlumniProfileUpdateSerializer , StudentProfileUpdateSerializer, ConnectionSerializer, CompanyProfileUpdateSerializer , NotificationSerializer ,NotificationListSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import IsAuthenticated, AllowAny
import pandas as pd
from rest_framework.views import APIView
from django.contrib.auth import authenticate
from rest_framework.decorators import api_view , action, permission_classes
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.db.models import Q
import logging , json , os
from django.shortcuts import get_object_or_404
import urllib.request
from django.core.files import File
from django.views import View
from django.http import JsonResponse
from django.contrib.auth.hashers import make_password
from django.utils import timezone
from django.core.exceptions import ObjectDoesNotExist
from .notifications import create_notification

logger = logging.getLogger(__name__)

Student_mocked_Data = "users/Mocked_Data/Student_mocked_Data.xlsx"
df = pd.read_excel(Student_mocked_Data, header=2)
Alumni_mocked_Data = "users/Mocked_Data/Alumni_mocked_Data.xlsx" 
alumni_df = pd.read_excel(Alumni_mocked_Data, header=0)

Staff_mocked_Data ="users/Mocked_Data/Staff_mocked_Data.xlsx"
staff_df=pd.read_excel(Staff_mocked_Data, header=5)

def is_user_AstuStudent(user_email, student_id):
    email_check = not df[df['Email'] == user_email].empty
    student_id_check = not df[df['ID'] == student_id].empty
    return email_check and student_id_check
def is_user_AstuAlumni(field_of_study, student_id):
    field_of_study = not alumni_df[alumni_df['Program'] == field_of_study].empty
    student_id_check = not alumni_df[alumni_df['Id Number'] == student_id].empty
    
    return field_of_study and student_id_check
def is_user_AstuStaff(staff_email, qualification):
    staff_email_exists = not staff_df[staff_df['Email'] == staff_email].empty
    staff_qualification_exists = not staff_df[staff_df['Qualification'] == qualification].empty
    return staff_qualification_exists and staff_email_exists


class StudentProfileCreateView(generics.CreateAPIView):
    queryset = StudentProfile.objects.all()
    serializer_class = StudentProfileSerializer
    permission_classes = [AllowAny]  

    def create(self, request, *args, **kwargs):       
        data = request.data.copy()   
        user_data = { 
            'email': data['user'].get('email'),
            'full_name': data['user'].get('full_name'),
            'usertype': data['user'].get('usertype'),
            'password': data['user'].get('password'),
}    
        required_keys = ['email', 'password', 'full_name', 'usertype']
        missing_keys = [key for key in required_keys if key not in user_data]

        if missing_keys:
            return Response(
                {"detail": f"Missing keys: {', '.join(missing_keys)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        student_id = data.get('student_id')

        if not all(user_data.values()) or student_id is None:
            return Response(
                {"detail": "Incomplete user data or student ID is missing"},
                status=status.HTTP_400_BAD_REQUEST
            )

        user_email = user_data['email']
        if not is_user_AstuStudent(user_email, student_id):
            return Response(
                {"detail": "User is not available in the mocked data"},
                status=status.HTTP_400_BAD_REQUEST
            )
        data['user'] = user_data
   
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

class StudentProfileUpdateView(generics.UpdateAPIView):
    queryset = StudentProfile.objects.all()
    serializer_class = StudentProfileUpdateSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user.student_profile

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', True)
        student_profile = self.get_object()
        
       
        user = self.request.user
        
        data = request.data    
       
        current_email = user.email
        current_full_name = user.full_name  
        current_usertype = user.usertype  
        current_areas_of_interest = user.areas_of_interest
        
        profile_pic = request.FILES.get('profile_pic') or request.data.get('profile_pic')

        if profile_pic:
            if student_profile.profile_pic:
                current_pic_path = student_profile.profile_pic.path
                if os.path.isfile(current_pic_path):
                    try:
                        os.remove(current_pic_path)
                    except PermissionError:
                        return Response({"error": "Unable to delete the current profile picture; it may be in use."},
                                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            # Handle new profile picture upload or URL
            if isinstance(profile_pic, str):
                if profile_pic.startswith("http://") or profile_pic.startswith("https://"):
                    result = urllib.request.urlretrieve(profile_pic)
                    with open(result[0], 'rb') as f:
                        student_profile.profile_pic.save(os.path.basename(profile_pic), File(f))
                else:
                    student_profile.profile_pic.save(os.path.basename(profile_pic.name), profile_pic)
            else:
                student_profile.profile_pic = profile_pic    
                
        updated_data = {
            "email": current_email, 
            "full_name": current_full_name, 
            "usertype": current_usertype,  
            "areas_of_interest": current_areas_of_interest,

            "student_id": data.get("student_id", student_profile.student_id),             
            "department": data.get("department", student_profile.department),  
            "admission_year": data.get("qualification", student_profile.admission_year),  
            "graduation_year": data.get("graduation_year", student_profile.graduation_year),  
            "phone_number": data.get("phone_number", student_profile.phone_number),  
            "achievements": data.get("achievements", student_profile.achievements), 
            "activities": data.get("activities", student_profile.activities), 
            "bio": data.get("bio", student_profile.bio), 
            "interests": data.get("interests", student_profile.interests), 
            "professional_experiences": data.get("professional_experiences", student_profile.professional_experiences),  
            "profile_pic": student_profile.profile_pic,
            "skills": data.get("skills", student_profile.skills), 
        }

        serializer = self.get_serializer(student_profile, data=updated_data, partial=partial)

        # Validate the serializer; it should validate the fields defined in AlumniProfileUpdateSerializer
        serializer.is_valid(raise_exception=True)

        # Save and return the updated profile
        self.perform_update(serializer)

        return Response(serializer.data, status=status.HTTP_200_OK)        
       


# Alumni Profile Create view
class AlumniProfileCreateView(generics.CreateAPIView):
    queryset = AlumniProfile.objects.all()
    serializer_class = AlumniProfileSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        # logging.error(f"{data}")
        user_data = {
            'email': data['user'].get('email'),
            'full_name': data['user'].get('full_name'),
            'usertype': data['user'].get('usertype'),
            'password': data['user'].get('password'),
            'areas_of_interest': data['user'].get('areas_of_interest'), 
        }
        required_keys = ['email', 'password', 'full_name', 'areas_of_interest']
        missing_keys = [key for key in required_keys if key not in user_data or not user_data[key]]

        if missing_keys:
            return Response(
                {"detail": f"Missing keys in user data: {', '.join(missing_keys)}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        student_id = data.get('student_id')
        qualification = data.get('qualification')
        field_of_study = data.get('field_of_study')
        graduated_year = data.get('graduated_year')
        employment_status = data.get('employment_status')

        if student_id is None or qualification is None or field_of_study is None or graduated_year is None or employment_status is None:
            return Response(
                {"detail": "Incomplete data: student ID, qualification, field of study, graduated year, and employment status are required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        if AlumniProfile.objects.filter(student_id=student_id).exists():
            return Response(
                {"detail": "An alumni profile with this student ID already exists."},
                status=status.HTTP_400_BAD_REQUEST
            )        
        data['user'] = user_data        
        if not is_user_AstuAlumni(field_of_study, student_id):
            return Response(
                {"detail": "User with this Id and field of study doesn't exist!"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class AlumniProfileUpdateView(generics.UpdateAPIView):
    queryset = AlumniProfile.objects.all()
    serializer_class = AlumniProfileUpdateSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user.alumni_profile

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', True)
        alumni_profile = self.get_object()
        
        user = self.request.user
        
        data = request.data    
        user_data = data.get("user", "{}")  
        try:
            user_data = json.loads(user_data)  
        except json.JSONDecodeError as e:
            return Response({"error": "Invalid JSON format in user field"}, status=status.HTTP_400_BAD_REQUEST)

        if isinstance(user_data, dict):
            user.areas_of_interest = user_data.get("areas_of_interest", user.areas_of_interest)
            user.save()   
        
        current_email = user.email
        current_full_name = user.full_name
        current_usertype = user.usertype
        
        profile_picture = request.FILES.get('profile_picture') or request.data.get('profile_picture')

        # Handle profile picture updates
        if profile_picture:
            if alumni_profile.profile_picture:
                current_pic_path = alumni_profile.profile_picture.path
                # Attempt to remove the current picture
                if os.path.isfile(current_pic_path):
                    try:
                        os.remove(current_pic_path)
                    except PermissionError:
                        return Response({"error": "Unable to delete the current profile picture; it may be in use."},
                                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            # Handle new profile picture upload or URL
            if isinstance(profile_picture, str):
                if profile_picture.startswith("http://") or profile_picture.startswith("https://"):
                    result = urllib.request.urlretrieve(profile_picture)
                    with open(result[0], 'rb') as f:
                        alumni_profile.profile_picture.save(os.path.basename(profile_picture), File(f))
                else:
                    alumni_profile.profile_picture.save(os.path.basename(profile_picture.name), profile_picture)
            else:
                alumni_profile.profile_picture = profile_picture    
      
        updated_data = {
            "email": current_email,
            "full_name": current_full_name,
            "usertype": current_usertype,
            "student_id": data.get("student_id", alumni_profile.student_id),
            "qualification": data.get("qualification", alumni_profile.qualification),
            "field_of_study": data.get("field_of_study", alumni_profile.field_of_study),
            "graduated_year": data.get("graduated_year", alumni_profile.graduated_year),
            "employment_status": data.get("employment_status", alumni_profile.employment_status),
            "company": data.get("company", alumni_profile.company),
            "job_title": data.get("job_title", alumni_profile.job_title),
            "professional_field": data.get("professional_field", alumni_profile.professional_field),
            "bio": data.get("bio", alumni_profile.bio),
            "profile_picture": alumni_profile.profile_picture,
            "work_history": data.get("work_history", alumni_profile.work_history),
        }

        serializer = self.get_serializer(alumni_profile, data=updated_data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
           
class StaffProfileCreateView(generics.CreateAPIView):
    queryset = StaffProfile.objects.all()
    serializer_class = StaffProfileSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        logging.error(f"{data}")
        user_data = {
            'email': data['user'].get('email'),
            'full_name': data['user'].get('full_name'),
            'usertype': data['user'].get('usertype'),
            'password': data['user'].get('password'),
        }
        
        staff_email = user_data['email']
        qualification = data.get('qualifications')
       
        if not is_user_AstuStaff(staff_email, qualification):
            return Response(
                {"detail": "User is not available in the mocked data"},
                status=status.HTTP_400_BAD_REQUEST
            )
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
                          
class CompanyCreateView(generics.CreateAPIView):
    queryset = CompanyProfile.objects.all()
    serializer_class = CompanyProfileSerializer
    permission_classes = [AllowAny]

class CompanyProfileUpdateView(generics.UpdateAPIView):
    queryset = CompanyProfile.objects.all()
    serializer_class = CompanyProfileUpdateSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'user_id'

    def get_object(self):
        user_id = self.kwargs.get('user_id')
        try:
            return CompanyProfile.objects.get(user_id=user_id)
        except ObjectDoesNotExist:
            logger.error(f"CompanyProfile with user_id {user_id} does not exist.")
            return Response({'error': 'Company profile not found.'}, status=status.HTTP_404_NOT_FOUND)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        company_profile = self.get_object()
        if isinstance(company_profile, Response):
            return company_profile

        updated_data = request.data.copy()
        logger.debug(f"Request data: {updated_data}")
        logger.debug(f"Request files: {request.FILES}")

        # Handle profile_picture
        profile_picture = request.FILES.get('profile_picture')
        if profile_picture:
            # New file uploaded
            company_profile.profile_picture = profile_picture
            logger.debug(f"New profile picture uploaded: {profile_picture.name}")
        else:
            # No new file; preserve existing profile_picture
            updated_data.pop('profile_picture', None)
            logger.debug("No new profile picture; preserving existing.")

        # Handle user data
        user_data = updated_data.get('user')
        if user_data:
            try:
                user_data = json.loads(user_data)
                user_serializer = UserSerializer(company_profile.user, data=user_data, partial=True)
                if user_serializer.is_valid():
                    user_serializer.save()
                else:
                    logger.error(f"User serializer errors: {user_serializer.errors}")
                    return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            except json.JSONDecodeError:
                logger.error("Invalid JSON in user data.")
                return Response({'error': 'Invalid user data format.'}, status=status.HTTP_400_BAD_REQUEST)
        updated_data.pop('user', None)

        serializer = self.get_serializer(company_profile, data=updated_data, partial=partial)
        try:
            serializer.is_valid(raise_exception=True)
        except Exception as e:
            logger.error(f"Serializer validation error: {e}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        logger.debug(f"Updated data for serializer: {updated_data}")
        self.perform_update(serializer)

        # Log final state
        logger.debug(f"Updated company profile: {company_profile.__dict__}")
        return Response(serializer.data, status=status.HTTP_200_OK)
class CompanyProfileView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        email = request.query_params.get('email')
        logging.debug(f"Fetching company profile: email={email}, user_id={request.user.id}")
        
        if not email:
            logger.warning("Missing email parameter")
            return Response(
                {'error': 'Email is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(email=email)
            if user != request.user:
                logger.warning(f"Unauthorized profile access: user_id={request.user.id}, email={email}")
                return Response(
                    {'error': 'You are not authorized to view this profile'},
                    status=status.HTTP_403_FORBIDDEN
                )
            profile = CompanyProfile.objects.get(user=user)
            serializer = CompanyProfileSerializer(profile, context={'request': request})
            logger.info(f"Profile fetched: user_id={user.id}, company_name={profile.company_name}")
            return Response(serializer.data, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            logger.error(f"User not found: email={email}")
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except CompanyProfile.DoesNotExist:
            logger.error(f"Company profile not found: email={email}")
            return Response(
                {'error': 'Company profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error fetching profile: {str(e)}")
            return Response(
                {'error': f'Failed to fetch profile: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )



User = get_user_model()

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        
        user = authenticate(request, username=email, password=password)

        if user is not None:
            
            user.last_login = timezone.now()
            user.save(update_fields=['last_login'])
            
            refresh = RefreshToken.for_user(user)
            user_data = UserSerializer(user).data

            profile_data = {}
            
            if user.usertype == 'Alumni':
                profile = AlumniProfile.objects.filter(user=user).first()
                if profile:
                    profile_data = {
                        'field_of_study': profile.field_of_study,
                        'graduated_year': profile.graduated_year,
                        'company': profile.company,
                        'job_title': profile.job_title,     
                        'student_id': profile.student_id,   
                        'employment_status': profile.employment_status,  
                        'professional_field': profile.professional_field,                      
                    }
            elif user.usertype == 'student':
                profile = StudentProfile.objects.filter(user=user).first()
                if profile:
                    profile_data = {    
                        'student_id': profile.student_id,   
                        'department': profile.department,  
                        'admission_year': profile.admission_year, 
                        'graduation_year': profile.graduation_year,
                        'phone_number': profile.phone_number,                 
                    }
            elif user.usertype == 'company':
                profile = CompanyProfile.objects.filter(user=user).first()
                if profile:
                    profile_data = {
                        'company_name': profile.company_name,
                        'company_address': profile.company_address,
                        'company_city': profile.company_city,
                        'postal_code': profile.postal_code,
                        'company_country': profile.company_country,
                        'contact_person_phone_number': profile.contact_person_phone_number,
                        'website_url': profile.website_url,  
                    }
            elif user.usertype == 'staff':
                profile = StaffProfile.objects.filter(user=user).first()
                if profile:
                    profile_data = {
                        'position': profile.position,
                        'department': profile.department,
                        'qualifications': profile.qualifications,
                        'expertise': profile.expertise,  
                        'years_of_experience': profile.years_of_experience,  
                    }
                    
           
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': user_data,
                'profile': profile_data,
            }, status=status.HTTP_200_OK)
        else:
            logging.error(f"Invalid credentials provided for email: {email}")
            logging.error(f"Request data: {request.data}")
            return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        
class UserSearchView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]   

    def get_queryset(self):
        queryset = CustomUser.objects.all()  
        search_term = self.request.query_params.get('search', None)
        search_type = self.request.query_params.get('type', None)          
        if search_type == 'student':
            queryset = queryset.filter(usertype='student') 
        elif search_type== 'Alumni':
            queryset=queryset.filter(usertype='Alumni')
        elif search_type=='staff':
            queryset = queryset.filter(usertype='staff')
        elif search_type=='company':
            queryset =queryset.filter(usertype= 'company')
        elif search_type == 'all_users':
            pass

        if search_term:
            queryset = queryset.filter(
                Q(full_name__icontains=search_term)
            )

        return queryset

# JWT Token Obtain Pair View
class ObtainTokenPairView(TokenObtainPairView):
    pass

class MentorSearchView(generics.ListAPIView):
    serializer_class = MentorSearchSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        search_term = self.request.query_params.get('name', None)
        department = self.request.query_params.get('department', None)

        # Log the incoming request parameters
        logging.info(f"Received search request with: search_term='{search_term}', department='{department}'")

        # Base queryset for searching Users
        queryset = User.objects.all()

        # If a department is provided, filter recommended users by that department
        if department:
            alumni_recommendations = User.objects.filter(
                alumni_profile__field_of_study=department
            )
            staff_recommendations = User.objects.filter(
                staff_profile__department=department
            )            
            recommended_users = alumni_recommendations | staff_recommendations

            # Filter the main queryset to include only users from the specified department
            queryset = queryset.filter(
                Q(alumni_profile__field_of_study=department) | 
                Q(staff_profile__department=department) |
                Q(id__in=recommended_users.values_list('id', flat=True))
            )

        if search_term:            
            queryset = queryset.filter(
                Q(full_name__icontains=search_term) &
                Q(areas_of_interest__contains=({"mentoring": True}))
                
            )

        return queryset.distinct()  

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)      
        logging.info(f"Serialized data: {serializer.data}") 

        return Response(serializer.data, status=status.HTTP_200_OK)


class AlumniProfileView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]  
    queryset = AlumniProfile.objects.select_related('user') 
    serializer_class = ProfileSerializer_Alumni

    def get_object(self):
        email = self.request.query_params.get('email')
        return self.queryset.get(user__email=email)

class StudentProfileFetchView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    queryset = StudentProfile.objects.select_related('user')
    serializer_class = StudentProfileUpdateSerializer
    def get_object(self):
        email =self.request.query_params.get('email')
        return self.queryset.get(user__email=email)
    
    
class UserCountsView(View):
    permission_classes = [AllowAny]
    def get(self, request):
        alumni_count = CustomUser.objects.filter(usertype='alumni').count()
        student_count = CustomUser.objects.filter(usertype='student').count()
        faculty_count = CustomUser.objects.filter(usertype='faculty').count()
        companies_count = CustomUser.objects.filter(usertype='company').count()

        # Counting employed and unemployed alumni
        employed_alumni_count = AlumniProfile.objects.filter(user__usertype='alumni', employment_status='Employed').count()
        unemployed_alumni_count = AlumniProfile.objects.filter(user__usertype='alumni', employment_status='Unemployed').count()

        data = {
            'students': student_count,
            'faculty': faculty_count,
            'alumni': alumni_count,
            'companies': companies_count,
            'employedAlumni': employed_alumni_count,
            'unemployedAlumni': unemployed_alumni_count,
        }
        return JsonResponse(data)


# class ConnectionViewSet(viewsets.ModelViewSet):
#     queryset = Connection.objects.all()
#     serializer_class = ConnectionSerializer
#     permission_classes = [IsAuthenticated]

#     def create(self, request):
#         data = request.data
#         requester = request.user
#         requestee_id = data.get('requestee_id')

#         logging.info(f"User {requester.id} is attempting to connect with user {requestee_id}")

#         requestee_id = str(requestee_id).strip()
        
#         # Prevent sending a connection request to themselves
#         if requestee_id == str(requester.id):
#             logging.warning(f"User {requester.id} attempted to send a connection request to themselves.")
#             return Response(
#                 {"error": "You cannot send a connection request to yourself."},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#         # Check if the connection request already exists
#         existing_connection = Connection.objects.filter(
#             requester=requester, requestee_id=requestee_id
#         ).first()

#         if existing_connection:
#             return Response(
#                 {"error": "Connection request already sent."},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#         # Check if the reverse connection exists
#         reverse_connection = Connection.objects.filter(
#             requester_id=requestee_id, requestee=requester, status='pending'
#         ).first()

#         if reverse_connection:
#             return Response(
#                 {"error": "You have already received a connection request from this user."},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#         # Create a new connection request
#         connection = Connection.objects.create(requester=requester, requestee_id=requestee_id, status='pending')
#         serializer = ConnectionSerializer(connection)
#         return Response(serializer.data, status=status.HTTP_201_CREATED)
#     def accept(self, request, pk=None):
#         requestee = request.user

#         try:
#             connection = Connection.objects.get(id=pk, requestee=requestee)
#             connection.status = 'accepted'
#             connection.save()

#             return Response({"message": "Connection accepted."}, status=status.HTTP_200_OK)        
#         except Exception as e:
#             return Response({"error": "An unexpected error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
#     def reject(self, request, pk=None):
#         requestee = request.user

#         try:
#             # Fetch the connection object
#             connection = Connection.objects.get(id=pk, requestee=requestee)

#             connection.status = 'rejected'
#             connection.save()
#             return Response({"message": "Connection rejected."}, status=status.HTTP_200_OK)

#         except Connection.DoesNotExist:
#             return Response({"error": "Connection not found."}, status=status.HTTP_404_NOT_FOUND)
        
#         except Exception as e:            
#             return Response({"error": "An unexpected error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
#     def cancel_reject(self, request, pk=None):
#         requestee = request.user

#         try:
#             connection = Connection.objects.get(id=pk, requestee=requestee)          
#             connection.status = 'pending' 
#             connection.save()

#             return Response({"message": "Rejection cancelled, connection is now pending."}, status=status.HTTP_200_OK)

#         except Exception as e:
#             return Response({"error": "An unexpected error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    
#     def list(self, request):
#         connections = Connection.objects.filter(
#             Q(requester=request.user) | Q(requestee=request.user)
#         )

#         connection_data = []
#         for connection in connections:
#             connection_info = ConnectionSerializer(connection).data
            
#             # Fetch requestee data
#             requestee_info = UserSerializer(connection.requestee).data
            
#             # Fetch additional profile data based on requestee type
#             if hasattr(connection.requestee, 'alumni_profile'):
#                 profile_info = AlumniProfileUpdateSerializer(connection.requestee.alumni_profile).data
#             elif hasattr(connection.requestee, 'student_profile'):
#                 profile_info = StudentProfileUpdateSerializer(connection.requestee.student_profile).data
#             elif hasattr(connection.requestee, 'company'):
#                 profile_info = CompanyProfileSerializer(connection.requestee.company).data
#             elif hasattr(connection.requestee, 'staff'):
#                 profile_info = StaffProfileSerializer(connection.requestee.staff).data
#             else:
#                 profile_info = {}

#             requestee_info['profile'] = profile_info
#             connection_info['requestee'] = requestee_info
            
#             connection_data.append(connection_info)

#         return Response(connection_data, status=status.HTTP_200_OK)

class ConnectionViewSet(viewsets.ModelViewSet):
    queryset = Connection.objects.all()
    serializer_class = ConnectionSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request):
        data = request.data
        requester = request.user
        requestee_id = data.get('requestee_id')

        logging.info(f"User {requester.id} is attempting to connect with user {requestee_id}")

        requestee_id = str(requestee_id).strip()
        
        # Prevent sending a connection request to themselves
        if requestee_id == str(requester.id):
            logging.warning(f"User {requester.id} attempted to send a connection request to themselves.")
            return Response(
                {"error": "You cannot send a connection request to yourself."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if the connection request already exists
        existing_connection = Connection.objects.filter(
            requester=requester, requestee_id=requestee_id
        ).first()

        if existing_connection:
            return Response(
                {"error": "Connection request already sent."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if the reverse connection exists
        reverse_connection = Connection.objects.filter(
            requester_id=requestee_id, requestee=requester, status='pending'
        ).first()

        if reverse_connection:
            return Response(
                {"error": "You have already received a connection request from this user."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create a new connection request
        connection = Connection.objects.create(requester=requester, requestee_id=requestee_id, status='pending')
        create_notification(
            connection.requestee,
            Notification.NOTIFICATION_TYPES[1][0], 
            f"You have a new connection request from {requester.full_name}."
        )
        
        serializer = ConnectionSerializer(connection)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def accept(self, request, pk=None):
        requestee = request.user

        try:
            connection = Connection.objects.get(id=pk, requestee=requestee)
            connection.status = 'accepted'
            connection.save()
            
            # Create a notification for the requester
            create_notification(
                connection.requester,
                Notification.NOTIFICATION_TYPES[2][0], 
                f"{requestee.full_name} has accepted your connection request."
            )

            return Response({"message": "Connection accepted."}, status=status.HTTP_200_OK)        
        except Exception as e:
            return Response({"error": "An unexpected error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def reject(self, request, pk=None):
        requestee = request.user

        try:
            # Fetch the connection object
            connection = Connection.objects.get(id=pk, requestee=requestee)

            connection.status = 'rejected'
            connection.save()
            return Response({"message": "Connection rejected."}, status=status.HTTP_200_OK)

        except Connection.DoesNotExist:
            return Response({"error": "Connection not found."}, status=status.HTTP_404_NOT_FOUND)
        
        except Exception as e:            
            return Response({"error": "An unexpected error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    def cancel_reject(self, request, pk=None):
        requestee = request.user

        try:
            connection = Connection.objects.get(id=pk, requestee=requestee)          
            connection.status = 'pending' 
            connection.save()

            return Response({"message": "Rejection cancelled, connection is now pending."}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": "An unexpected error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def list(self, request):
        connections = Connection.objects.filter(
            Q(requester=request.user) | Q(requestee=request.user)
        )

        connection_data = []
        for connection in connections:
            connection_info = ConnectionSerializer(connection).data
            
            # Fetch requestee data
            requestee_info = UserSerializer(connection.requestee).data
            # Fetch requestee profile data based on type
            if hasattr(connection.requestee, 'alumni_profile'):
                profile_info = AlumniProfileUpdateSerializer(connection.requestee.alumni_profile).data
            elif hasattr(connection.requestee, 'student_profile'):
                profile_info = StudentProfileUpdateSerializer(connection.requestee.student_profile).data
            elif hasattr(connection.requestee, 'company'):
                profile_info = CompanyProfileSerializer(connection.requestee.company).data
            elif hasattr(connection.requestee, 'staff'):
                profile_info = StaffProfileSerializer(connection.requestee.staff).data
            else:
                profile_info = {}
            requestee_info['profile'] = profile_info
            connection_info['requestee'] = requestee_info
            
            # Fetch requester data
            requester_info = UserSerializer(connection.requester).data
            # Fetch requester profile data based on type
            if hasattr(connection.requester, 'alumni_profile'):
                profile_info = AlumniProfileUpdateSerializer(connection.requester.alumni_profile).data
            elif hasattr(connection.requester, 'student_profile'):
                profile_info = StudentProfileUpdateSerializer(connection.requester.student_profile).data
            elif hasattr(connection.requester, 'company'):
                profile_info = CompanyProfileSerializer(connection.requester.company).data
            elif hasattr(connection.requester, 'staff'):
                profile_info = StaffProfileSerializer(connection.requester.staff).data
            else:
                profile_info = {}
            requester_info['profile'] = profile_info
            connection_info['requester'] = requester_info
            
            connection_data.append(connection_info)

        return Response(connection_data, status=status.HTTP_200_OK)
       
    @action(detail=False, methods=['get'], url_path='status')
    def get_status(self, request):       
        requestee_ids = request.query_params.getlist('requestee_id')
        statuses = {}

      
        for requestee_id in requestee_ids:           
            connection = Connection.objects.filter(
                Q(requester=request.user, requestee_id=requestee_id) |
                Q(requester_id=requestee_id, requestee=request.user)
            ).first()

            # Initialize the status for the requestee ID
            statuses[requestee_id] = {
                "status": "none",  
                "connectedUserId": None, 
                "connectionId": None, 
            }

            if connection:
                statuses[requestee_id]["status"] = connection.status
                statuses[requestee_id]["connectionId"] = connection.id                  
                statuses[requestee_id]["RequesterId"]=connection.requestee_id                
                statuses[requestee_id]["connectedUserId"] = connection.requestee_id if connection.requester == request.user else connection.requester_id
                
                if request.user.id == connection.requestee_id and connection.status == "pending":
                    statuses[requestee_id]["acceptReject"] = True  
                else:
                    statuses[requestee_id]["acceptReject"] = False  
            else:
                logging.info(f"No connection found for user {request.user.id} <-> {requestee_id}")

        
        return Response(statuses, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password(request):
    email = request.data.get('email')
    full_name = request.data.get('full_name')
    new_password = request.data.get('new_password')
    user_type = request.data.get('user_type')
    logging.info(f"error: {user_type}")
    logging.info(f"Received forgot password request for email: {email}")

    try:
        user = CustomUser.objects.get(email=email)

        if user.full_name != full_name or user.usertype != user_type:
            return JsonResponse({'error': 'Invalid input. Please check your data and try again.'}, status=400)

        user.password = make_password(new_password)
        user.save()
        return JsonResponse({'message': 'Password reset successfully.'}, status=200)

    except CustomUser.DoesNotExist:
        return JsonResponse({'error': 'User not found.'}, status=404)
    
    

class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Notification.objects.filter(user=user).order_by('-created_at')
    
class NotificationDetailView(generics.UpdateAPIView):
    queryset = Notification.objects.all()
    serializer_class = NotificationListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        logging.error(f"Fetching notification with ID: {self.kwargs['pk']}")
        return get_object_or_404(Notification, id=self.kwargs['pk'], user=self.request.user)

    def patch(self, request, *args, **kwargs):
        notification = self.get_object()  
        notification_is_read = request.data.get('is_read', True)  
        notification.is_read = notification_is_read
        notification.save()
        return Response(self.get_serializer(notification).data)