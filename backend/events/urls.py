from .views import EventCreateView, EventList, EventDeleteView, EventApproveView, EventListForUser ,UserEventListView, EventUpdateView, OpportunityListCreate , OpportunityDetail, OpportunityApproveView,InternshipListView, InternshipAppliedListView, InternshipApplicationCreateView, ListOfInternshipApplicant, JobApplicationListView, JobOpportunityListView , JobApplicationCreateView, InternshipApplicationStatusUpdateView, JobApplicationStatusUpdateView, JobApplicatiedListView ,  ResourceShareCreateView , AccessResourceShareView , EventDetailForUser
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [
    path('create-events/', EventCreateView.as_view(), name='create-event'),
    path('list/', EventList.as_view(), name='event-list'),
    path('delete/<int:pk>/', EventDeleteView.as_view(), name='event-delete'),
    path('approve/<int:pk>/', EventApproveView.as_view(), name='event-approve'),
    path('user-events/', UserEventListView.as_view(), name='user-event-list'),  
    path('update/<int:pk>/', EventUpdateView.as_view(), name='event-update'),
    path('opportunities/', OpportunityListCreate.as_view(), name='opportunity-list-create'),
    path('opportunities/<int:pk>/', OpportunityDetail.as_view(), name='opportunity-detail'),
    path('opportunities/approve/<int:pk>/', OpportunityApproveView.as_view(), name='opportunity-approve'),
    path('internships/', InternshipListView.as_view(), name='internship-list'),
    path('jobs/', JobOpportunityListView.as_view(), name='job-list'),
    path('apply-internship/', InternshipApplicationCreateView.as_view(), name='apply-internship'),
    path('internship-applicant', ListOfInternshipApplicant.as_view(), name='intern-applicant'),
    path('internship-applications/<int:id>/status/', InternshipApplicationStatusUpdateView.as_view(), name='update-internship-application-status'),
    path('job-applications/<int:id>/status/', JobApplicationStatusUpdateView.as_view(), name='update-job-application-status'),
    path('job-applicant/', JobApplicationListView.as_view(), name='job-applicant'),
    path('job-applications/', JobApplicationCreateView.as_view(), name='job-application-list'),
    path('job-applied/', JobApplicatiedListView.as_view(), name='job-applied'),
    path('internship-applied/', InternshipAppliedListView.as_view(), name='internship-applied'),
    path('resource-share/',  ResourceShareCreateView.as_view(), name='resource-share'),
    path('access-resource-share/', AccessResourceShareView.as_view(), name='access-resource-share'),
    path('event-lists/', EventListForUser.as_view(),name='EventList'),
    path('event-lists/<int:pk>/', EventDetailForUser.as_view(), name='EventDetail'),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

