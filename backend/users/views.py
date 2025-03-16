from rest_framework import generics, status
from rest_framework.response import Response
from .models import StudentProfile, AlumniProfile, StaffProfile, CompanyProfile, CustomUser 
from .serializers import StudentProfileSerializer, AlumniProfileSerializer,UserProfileSerializer ,StaffProfileSerializer, CompanyProfileSerializer , UserSerializer, MentorSearchSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import IsAuthenticated, AllowAny
import pandas as pd
from rest_framework.views import APIView
from django.contrib.auth import authenticate
from rest_framework.decorators import api_view
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.db.models import Q
import logging , json 
from django.shortcuts import get_object_or_404


Student_mocked_Data = "users/Mocked_Data/Student_mocked_Data.xlsx"
df = pd.read_excel(Student_mocked_Data, header=2)
Alumni_mocked_Data = "users/Mocked_Data/Alumni_mocked_Data.xlsx" 
alumni_df = pd.read_excel(Alumni_mocked_Data, header=0)

Staff_mocked_Data ="users/Mocked_Data/Staff_mocked_Data.xlsx"
staff_df=pd.read_excel(Staff_mocked_Data, header=5)
# logging.error(f"{staff_df['Email']} and {[staff_df['Qualification']]}")  

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
    # 'confirm_password': data['user'].get('confirm_password'), 
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
        logging.error(f"All data :{user_data}")

        if student_id is None or qualification is None or field_of_study is None or graduated_year is None or employment_status is None:
            return Response(
                {"detail": "Incomplete data: student ID, qualification, field of study, graduated year, and employment status are required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        data['user'] = user_data        
        if not is_user_AstuAlumni(field_of_study, student_id):
            return Response(
                {"detail": "User is not available in the mocked data"},
                status=status.HTTP_400_BAD_REQUEST
            )
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        
       
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
    
# User = get_user_model()

# class LoginView(APIView):
#     permission_classes = [AllowAny]
#     logging.info(f"Received data:")

#     def post(self, request):
#         email = request.data.get('email')
#         password = request.data.get('password')
#         logging.info(f"Received data: email={email}, password={password}")

#         user = authenticate(request, username=email, password=password)

#         if user is not None:
#             refresh = RefreshToken.for_user(user)
#             user_data = UserSerializer(user).data

#             return Response({
#                 'refresh': str(refresh),
#                 'access': str(refresh.access_token),
#                 'user': user_data,
#             }, status=status.HTTP_200_OK)
#         else:
#             logging.error("Invalid credentials provided")
#             return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

User = get_user_model()

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        logging.info(f"Login attempt for email: {email}")
        
        user = authenticate(request, username=email, password=password)

        if user is not None:
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

            logging.info("User authenticated successfully")
           
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
# class MentorSearchView(generics.ListAPIView):
#     serializer_class = MentorSearchSerializer
#     permission_classes = [AllowAny]

#     def get_queryset(self):
#         search_term = self.request.query_params.get('name', None)
#         department = self.request.query_params.get('department', None)

#         # Log the incoming request parameters
#         logging.info(f"Received search request with: search_term='{search_term}', department='{department}'")

#         # Base queryset for searching Users
#         queryset = User.objects.all()

#         # Filtering by search term (full_name or email)
#         if search_term:
#             queryset = queryset.filter(
#                 Q(full_name__icontains=search_term) | Q(email__icontains=search_term)
#             )

#         # If a department is provided, filter recommended users by that department
#         if department:
#             # Fetch recommended users whose department matches the provided department
#             alumni_recommendations = User.objects.filter(
#                 alumni_profile__field_of_study=department
#             )
#             staff_recommendations = User.objects.filter(
#                 staff_profile__department=department
#             )

#             # Combine the two querysets
#             recommended_users = alumni_recommendations | staff_recommendations

#             # Filter the main queryset to include only users from the specified department
#             queryset = queryset.filter(
#                 Q(alumni_profile__field_of_study=department) | 
#                 Q(staff_profile__department=department) |
#                 Q(id__in=recommended_users.values_list('id', flat=True))
#             )

#         return queryset.distinct()  # Ensure unique results

#     def list(self, request, *args, **kwargs):
#         queryset = self.get_queryset()
#         serializer = self.get_serializer(queryset, many=True)
#         return Response(serializer.data, status=status.HTTP_200_OK)
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

        # Search by name if a search term is provided
        if search_term:
            
            queryset = queryset.filter(
                Q(full_name__icontains=search_term) &
                Q(areas_of_interest__contains=({"mentoring": True}))
                
            )

        return queryset.distinct()  

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)       

        return Response(serializer.data, status=status.HTTP_200_OK)


class UserProfileView(generics.RetrieveAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [AllowAny]  

    def get(self, request, *args, **kwargs):
        email = request.query_params.get('email')
        if not email:
            return Response({'error': 'Email parameter is required.'}, status=status.HTTP_400_BAD_REQUEST)
        user = get_object_or_404(CustomUser, email=email)  
        
        serializer = self.get_serializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)