from django.urls import path
from .views import StudentProfileCreateView,  ObtainTokenPairView, AlumniProfileCreateView, StaffProfileCreateView,CompanyCreateView
from rest_framework_simplejwt.views import TokenRefreshView
from .views import UserProfileView
# from .views import view_profile, update_profile

urlpatterns = [
    path('register/student/', StudentProfileCreateView.as_view(), name='register_student'),
    path('register/alumni/', AlumniProfileCreateView.as_view(), name='register_alumni'),
    path('register/staff/', StaffProfileCreateView.as_view(), name='register_staff'),
    path('register/company/', CompanyCreateView.as_view(), name= 'register_company'),
    path('token/', ObtainTokenPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', UserProfileView.as_view(), name='user_profile'),
    # path('view_profile/', view_profile, name='view_profile'),
    # path('profile/update/', update_profile, name='update_profile'),
]