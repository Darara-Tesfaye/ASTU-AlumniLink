from rest_framework import generics, status
from rest_framework.response import Response
from .models import StudentProfile, AlumniProfile, StaffProfile, CompanyProfile, CustomUser 
from .serializers import StudentProfileSerializer, AlumniProfileSerializer, StaffProfileSerializer, CompanyProfileSerializer , UserSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import IsAuthenticated, AllowAny
import pandas as pd
from rest_framework.views import APIView
from django.contrib.auth import authenticate
from rest_framework.decorators import api_view
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.db.models import Q
import logging


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
        # Extract user data from the nested structure
        user_data = {
            'email': data['user'].get('email'),
            'full_name': data['user'].get('full_name'),
            'usertype': data['user'].get('usertype'),
            'password': data['user'].get('password'),
        }
        required_keys = ['email', 'password', 'full_name']
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

            logging.info("User authenticated successfully")
            
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': user_data,
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


# # views.py
# from django.shortcuts import render, redirect
# from django.contrib.auth.decorators import login_required
# from .forms import StudentProfileForm, AlumniProfileForm, StaffProfileForm

# @login_required
# def update_profile(request):
#     user = request.user
#     profile = None
#     profile_type = None

#     # Determine which profile to load based on usertype
#     if user.usertype == 'student':
#         profile = user.student_profile
#         profile_form = StudentProfileForm(instance=profile)
#         profile_type = 'student'
#     elif user.usertype == 'alumni':
#         profile = user.alumni_profile
#         profile_form = AlumniProfileForm(instance=profile)
#         profile_type = 'alumni'
#     elif user.usertype == 'staff':
#         profile = user.staff_profile
#         profile_form = StaffProfileForm(instance=profile)
#         profile_type = 'staff'

#     if request.method == 'POST':
#         if profile_type == 'student':
#             profile_form = StudentProfileForm(request.POST, instance=profile)
#         elif profile_type == 'alumni':
#             profile_form = AlumniProfileForm(request.POST, instance=profile)
#         elif profile_type == 'staff':
#             profile_form = StaffProfileForm(request.POST, instance=profile)

#         if profile_form.is_valid():
#             profile_form.save()
#             return redirect('profile')  # Redirect to profile page after saving

#     return render(request, 'update_profile.html', {
#         'profile_form': profile_form,
#         'profile_type': profile_type
#     })
    
# @login_required
# def view_profile(request):
#     user = request.user
#     profile = None

#     if user.usertype == 'student':
#         profile = user.student_profile
#     elif user.usertype == 'alumni':
#         profile = user.alumni_profile
#     elif user.usertype == 'staff':
#         profile = user.staff_profile

#     return render(request, 'view_profile.html', {
#         'user': user,
#         'profile': profile,
#     })