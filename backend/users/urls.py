from django.urls import path
from .views import StudentProfileCreateView,  ObtainTokenPairView,LoginView , AlumniProfileCreateView, StaffProfileCreateView,CompanyCreateView, UserSearchView
from rest_framework_simplejwt.views import TokenRefreshView


urlpatterns = [
    path('register/student/', StudentProfileCreateView.as_view(), name='register_student'),
    path('register/alumni/', AlumniProfileCreateView.as_view(), name='register_alumni'),
    path('register/staff/', StaffProfileCreateView.as_view(), name='register_staff'),
    path('register/company/', CompanyCreateView.as_view(), name= 'register_company'),
    path('token/', ObtainTokenPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('login/', LoginView.as_view(), name='user-login'),
    path('search/', UserSearchView.as_view(), name='user-search')
]