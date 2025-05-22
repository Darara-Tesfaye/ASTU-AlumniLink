from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from .views import forgot_password, StudentProfileCreateView,  ObtainTokenPairView,LoginView , UserCountsView, UserSearchView ,ConnectionViewSet ,StaffProfileCreateView,CompanyCreateView, MentorSearchView, AlumniProfileView, AlumniProfileCreateView, AlumniProfileUpdateView , StudentProfileUpdateView ,StudentProfileFetchView, CompanyProfileUpdateView, CompanyProfileView , NotificationListView , NotificationDetailView
from rest_framework_simplejwt.views import TokenRefreshView



urlpatterns = [
    path('register/student/', StudentProfileCreateView.as_view(), name='register_student'),
    path('register/alumni/', AlumniProfileCreateView.as_view(), name='register_alumni'),
    path('alumni/profile/update/<int:pk>/', AlumniProfileUpdateView.as_view(), name='update_alumni_profile'),
    path('student/profile/update/', StudentProfileUpdateView.as_view(), name='update_student_profile'),
    path('company/profile/update/<int:user_id>/', CompanyProfileUpdateView.as_view(), name='update_company_profile'),
    path('register/staff/', StaffProfileCreateView.as_view(), name='register_staff'),
    path('register/company/', CompanyCreateView.as_view(), name= 'register_company'),
    path('token/', ObtainTokenPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('login/', LoginView.as_view(), name='user-login'),
    path('search/', UserSearchView.as_view(), name='user-search'),
    path('search-mentor/', MentorSearchView.as_view(), name='Find-mentor'),
    path('profile/', AlumniProfileView.as_view() , name='user-profile'),
    path('student/profile/', StudentProfileFetchView.as_view(), name='student_profile'),
    path('company/profile/', CompanyProfileView.as_view(), name='company_profile'),
    path('usercounts/', UserCountsView.as_view(), name='user_counts'),
    
    path('connections/', ConnectionViewSet.as_view({'post': 'create'}), name='create_connection'),  
    path('connections/<int:pk>/accept/', ConnectionViewSet.as_view({'post': 'accept'}), name='accept_connection'),  
    path('connections/<int:pk>/reject/', ConnectionViewSet.as_view({'post': 'reject'}), name='reject_connection'),  
    path('connections/cancel-reject/<int:pk>/', ConnectionViewSet.as_view({'post': 'cancel_reject'}), name='cancel_reject_connection'),
    path('list-connections/', ConnectionViewSet.as_view({'get': 'list'}), name='list_connections'),  
    path('connections/status/', ConnectionViewSet.as_view({'get': 'get_status'}), name='get_connection_status'), 
    path('forgot-password/', forgot_password, name='forgot_password'),
    path('notifications/', NotificationListView.as_view(), name='notification-list'),
    path('notifications/<int:pk>/', NotificationDetailView.as_view(), name='notification-detail'),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)