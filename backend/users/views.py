from rest_framework import generics, status
from rest_framework.response import Response
from .models import StudentProfile, AlumniProfile, StaffProfile, CompanyProfile
from .serializers import StudentProfileSerializer, AlumniProfileSerializer, StaffProfileSerializer, CompanyProfileSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import IsAuthenticated, AllowAny
import pandas as pd
import logging
from rest_framework.views import APIView

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
    

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        usertype = user.usertype  
        return Response({
            'email': user.email,
            'usertype': usertype,
        })
        
        
# JWT Token Obtain Pair View
class ObtainTokenPairView(TokenObtainPairView):
    pass
