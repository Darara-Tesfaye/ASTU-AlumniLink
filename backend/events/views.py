from rest_framework import generics, permissions , parsers
from .models import Event, Opportunity, InternshipApplication, JobApplication, ResourceShare
from .serializers import EventSerializer, OpportunitySerializer, InternshipOpportunitySerializer, InternshipApplicationSerializer, JobOpportunitySerializer, JobApplicationSerializer, JobApplicationListSerializer,  ResourceShareSerializer ,ResourceShareAccessSerializer
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ValidationError
from users.models import CompanyProfile,  AlumniProfile , Notification , StudentProfile
from django.shortcuts import get_object_or_404
import logging, os , json
from django.utils import timezone
from users.notifications import create_notification
from django.contrib.auth import get_user_model
User = get_user_model()

class EventCreateView(generics.ListCreateAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [permissions.AllowAny]  

    def perform_create(self, serializer):
        if Event.objects.filter(
            title=serializer.validated_data.get('title'),
            description=serializer.validated_data.get('description'),
            participants=serializer.validated_data.get('participants'),
            created_by=self.request.user
        ).exists():
            return Response(
                {"detail": "An event with the same title, description, and participants already exists."},
                status=status.HTTP_400_BAD_REQUEST
            )
        serializer.save(created_by=self.request.user)
        
        
        
class EventList(generics.ListAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes =[permissions.AllowAny]  
    
class EventDeleteView(generics.DestroyAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]
    
# class EventApproveView(generics.UpdateAPIView):
#     queryset = Event.objects.all()
#     serializer_class = EventSerializer
#     permission_classes = [permissions.IsAuthenticated]

#     def patch(self, request, *args, **kwargs):  
#         event = self.get_object()
#         is_approved = request.data.get('is_approved', False)
#         event.is_approved = is_approved
#         event.save()
        
#         if is_approved:
#             participant_types = event.participants if event.participants else []
            
#             for participant_type in participant_types:
#                 users = User.objects.filter(usertype=participant_type)  
#                 for user in users:
#                     create_notification(
#                         user,
#                         Notification.NOTIFICATION_TYPES[3][0],  
#                         f"You are invited to partcipate in '{event.title}'."
#                     )

#         serializer = self.get_serializer(event)
#         return Response(serializer.data, status=status.HTTP_200_OK)


class EventApproveView(generics.UpdateAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, *args, **kwargs):  
        event = self.get_object()
        is_approved = request.data.get('is_approved', False)
        previous_approval_status = event.is_approved
        event.is_approved = is_approved
        event.save()

        if is_approved and not previous_approval_status:
            # Notify users when the event is approved
            participant_types = event.participants if event.participants else []
            
            for participant_type in participant_types:
                users = User.objects.filter(usertype=participant_type)  
                for user in users:
                    create_notification(
                        user,
                        Notification.NOTIFICATION_TYPES[3][0],  # Event announcement type
                        f"You are invited to participate in '{event.title}' (Event ID: {event.id}).",  
                        event=event  # Associate the notification with the event
                    )
        
        if not is_approved and previous_approval_status:
            # Remove notifications if the event is no longer approved
            participant_types = event.participants if event.participants else []
            
            for participant_type in participant_types:
                users = User.objects.filter(usertype=participant_type)
                for user in users:
                    # Assuming you have a method to delete notifications
                    Notification.objects.filter(
                        user=user,
                        notification_type=Notification.NOTIFICATION_TYPES[3][0],  # Adjust type as necessary
                        event=event  # This assumes your Notification model has a foreign key to Event
                    ).delete()

        serializer = self.get_serializer(event)
        return Response(serializer.data, status=status.HTTP_200_OK)

class UserEventListView(generics.ListAPIView):
    serializer_class = EventSerializer
    permission_classes = [permissions.AllowAny]
  
    def get_queryset(self):
        return Event.objects.filter(created_by_id=self.request.user)
    
class EventUpdateView(generics.UpdateAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_update(self, serializer):
        event_instance = self.get_object()
        title = serializer.validated_data.get('title', event_instance.title)
        description=serializer.validated_data.get('description', event_instance.description),
        participants = serializer.validated_data.get('participants', event_instance.participants),

        if Event.objects.filter(
            title=title,
            description=description,
            participants=participants,
         
        ).exclude(pk=event_instance.pk).exists():
            
            return Response(
                {"detail": "An event with the same title, description, and participants already exists."},
                status=status.HTTP_400_BAD_REQUEST
            )
        serializer.save(is_approved=0)


class EventListForUser(generics.ListAPIView):
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        
        try:
            student_profile = user.student_profile  # Assuming the related name is 'student_profile'
            department = student_profile.department
            user_type = 'students'  # Assuming this is set for students
        except StudentProfile.DoesNotExist:
            try:
                alumni_profile = user.alumni_profile  # Assuming the related name is 'alumni_profile'
                field_of_study = alumni_profile.field_of_study
                user_type = 'alumni'  # Assuming this is set for alumni
            except AlumniProfile.DoesNotExist:
                return Event.objects.none()  # Return empty queryset if user profile not found

        # Retrieve events that meet the conditions
        events = Event.objects.filter(is_approved=True)

        if user_type == 'students':
            events = events.filter(department=department)
        
        if user_type == 'alumni':
            events = events.filter(participants__contains=[field_of_study])

        return events
class EventDetailForUser(generics.RetrieveAPIView):
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'pk'
    def retrieve(self, request, *args, **kwargs):
        event = self.get_object()
        serializer = self.get_serializer(event)
        return Response(serializer.data)
               
class OpportunityListCreate(generics.ListCreateAPIView):    
    queryset = Opportunity.objects.all()
    serializer_class = OpportunitySerializer
    permission_classes = [permissions.IsAuthenticated] 
    
    def perform_create(self, serializer):
        if Opportunity.objects.filter(
            title=serializer.validated_data.get('title'),
            start_date=serializer.validated_data.get('start_date'),
            end_date=serializer.validated_data.get('end_date'),
            created_by=self.request.user
        ).exists():
            raise ValidationError("An opportunity with the same title, start date, and end date already exists.")
        
        serializer.save(created_by=self.request.user) 
    

class OpportunityDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Opportunity.objects.all()
    serializer_class = OpportunitySerializer
    permission_classes = [permissions.IsAuthenticated] 
    
class OpportunityApproveView(generics.UpdateAPIView):
    queryset = Opportunity.objects.all()
    serializer_class = OpportunitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, *args, **kwargs):
        opportunity = self.get_object()
        is_approved = request.data.get('is_approved', False)

        previous_approval_status = opportunity.is_approved
      
        
        
        # Update the approval status
        opportunity.is_approved = is_approved
        opportunity.save()
        if is_approved and not previous_approval_status:
            self.send_notifications(opportunity)
        
        if not is_approved and previous_approval_status:
            self.delete_notifications(opportunity)
        
        serializer = self.get_serializer(opportunity)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def send_notifications(self, opportunity):
        if opportunity.start_date and opportunity.start_date > timezone.now().date():
            if opportunity.type == 'internship':
                students = User.objects.filter(usertype='student')
                for student in students:
                    create_notification(
                        user=student,
                        notification_type='new_opportunity',
                        message=f"A new internship opportunity '{opportunity.title}' has been posted.",
                    )
        if opportunity.type == 'Job':
            alumni = User.objects.filter(usertype='Alumni')
            for alumnus in alumni:
                create_notification(
                    user=alumnus,
                    notification_type='new_opportunity',
                    message=f"A new job opportunity '{opportunity.title}' has been posted.",
                )
    def delete_notifications(self, opportunity):
        Notification.objects.filter(
            notification_type='new_opportunity',
            message__icontains=opportunity.title
        ).delete()
                        
              
class InternshipApplicationUpdateView(generics.UpdateAPIView):
    queryset = InternshipApplication.objects.all()
    serializer_class = InternshipApplicationSerializer

class InternshipListView(generics.ListAPIView):
    serializer_class = InternshipOpportunitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Opportunity.objects.filter(type='internship', is_approved=True)

class InternshipApplicationCreateView(generics.CreateAPIView):
    serializer_class = InternshipApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        student_id = serializer.validated_data['student_id']
        internship = serializer.validated_data['internship']

        if InternshipApplication.objects.filter(student_id=student_id, internship=internship
        ).exists():
            raise ValidationError("You have already applied for this internship.")
                        
        serializer.save()
class ListOfInternshipApplicant(generics.ListAPIView):
    serializer_class= InternshipApplicationSerializer
    permission_classes =[permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        try:
            company_profile = CompanyProfile.objects.get(user=user)
            return InternshipApplication.objects.filter(
                internship__created_by=user
            ).select_related('internship')
        except CompanyProfile.DoesNotExist:
            return InternshipApplication.objects.none()
class InternshipApplicationStatusUpdateView(generics.UpdateAPIView):
    queryset = InternshipApplication.objects.all()
    serializer_class = InternshipApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, id):
        application = self.get_queryset().get(id=id)
        
        new_status = request.data.get("status")
        if new_status not in ['accepted', 'declined']:
            return Response(
                {"detail": "Invalid status. Must be 'accepted' or 'declined'."},
                status=status.HTTP_400_BAD_REQUEST
            )
        application.status = new_status
        application.save()
        if new_status == 'accepted':
            self.send_notification(application)
        serializer = self.get_serializer(application)
        return Response(serializer.data, status=status.HTTP_200_OK)  
    def send_notification(self, application):
        student_profile = get_object_or_404(StudentProfile, student_id=application.student_id)
        user = get_object_or_404(User, id=student_profile.user.id)
        create_notification(
            user=user,
            notification_type='internship_application_status',
            message=f"Your internship application has been viewed."
        )     

# class JobApplicationStatusUpdateView(generics.UpdateAPIView):
#     queryset = JobApplication.objects.all()
#     serializer_class = JobApplicationSerializer
#     permission_classes = [permissions.IsAuthenticated]

#     def patch(self, request, id):
#         application = self.get_queryset().get(id=id)    
        
#         new_status = request.data.get("status")
#         if new_status not in ['accepted', 'declined']:
#             return Response(
#                 {"detail": "Invalid status. Must be 'accepted' or 'declined'."},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
#         application.status = new_status
#         application.save()
#         if new_status == 'accepted':
#             self.send_notification(application)

#         serializer = self.get_serializer(application)
#         return Response(serializer.data, status=status.HTTP_200_OK)  
     
#     def send_notification(self, application):
#         alumni_profile = get_object_or_404(AlumniProfile, student_id=application.student_id)
#         user = alumni_profile.user

#         create_notification(
#             user=user,
#             notification_type='job_application_status',
#             message=f"Your job application for '{application.job.title}' has been accepted."
#         )


class JobApplicationStatusUpdateView(generics.UpdateAPIView):
    queryset = JobApplication.objects.all()
    serializer_class = JobApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, id):
        # Fetch the application using the provided ID
        application = self.get_queryset().get(id=id) 
        
        new_status = request.data.get("status")
        if new_status not in ['accepted', 'declined']:
            return Response(
                {"detail": "Invalid status. Must be 'accepted' or 'declined'."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update the application status
        application.status = new_status
        application.save()

        # Optionally send notification if the application is accepted
        if new_status == 'accepted':
            self.send_notification(application)

        serializer = self.get_serializer(application)
        return Response(serializer.data, status=status.HTTP_200_OK)  

    def send_notification(self, application):
        # Implementation for sending notification
        # Assuming you have a way to get the user from the application
        alumni_profile = get_object_or_404(AlumniProfile, student_id=application.alumni_id)
        user = alumni_profile.user

        create_notification(
            user=user,
            notification_type='job_application_status',
            message=f"Your job application for '{application.job.title}' has been viewed."
        )
        
class JobOpportunityListView(generics.ListAPIView):
    serializer_class = JobOpportunitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Opportunity.objects.filter(type='job', is_approved=True)

class JobApplicationCreateView(generics.CreateAPIView):
    serializer_class = JobApplicationSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        try:
            alumni_id = serializer.validated_data['alumni_id']
            job = serializer.validated_data['job']

            if JobApplication.objects.filter(alumni_id=alumni_id, job=job).exists():
                raise ValidationError("You have already applied for this job.")

            serializer.save()
        except Exception as e:
            raise ValidationError(f"An error occurred: {str(e)}")

# To List
class JobApplicationListView(generics.ListCreateAPIView):
    serializer_class = JobApplicationListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return JobApplication.objects.all()

class JobApplicatiedListView(generics.ListCreateAPIView):
    serializer_class = JobApplicationListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        alumni_profile = AlumniProfile.objects.get(user=self.request.user)
        student_id = alumni_profile.student_id  

        # Filter job applications where the alumni_id matches the student_id
        return JobApplication.objects.filter(alumni_id=student_id)

class InternshipAppliedListView(generics.ListAPIView):
    serializer_class = InternshipApplicationSerializer
    permission_classes = [permissions.AllowAny]
    # queryset = InternshipApplication.objects.all()

    def get_queryset(self):
        student_id = self.request.data.get('student_id')  
        logging.info(f"Student ID: {student_id}")
        
        if student_id is None:
            return InternshipApplication.objects.none() 

        return InternshipApplication.objects.filter(student_id=student_id)

# class ResourceShareCreateView(generics.CreateAPIView):
#          serializer_class = ResourceShareSerializer
#          permission_classes = [permissions.IsAuthenticated]
#          parser_classes = [parsers.MultiPartParser, parsers.FormParser]

#          def perform_create(self, serializer):
#              department = serializer.validated_data['department']
#              batch = serializer.validated_data['batch']
#              course = serializer.validated_data['course']
#              title = serializer.validated_data['title']
#              description = serializer.validated_data['description']

#              existing_resources = ResourceShare.objects.filter(
#                  staff=self.request.user,
#                  title=title,
#                  description=description
#              )

#              if existing_resources.exists():
#                  return Response(
#                      {"detail": "You have already shared a resource with the same title and description."},
#                      status=status.HTTP_400_BAD_REQUEST
#                  )

#              if 'file' in serializer.validated_data:
#                  uploaded_file = serializer.validated_data['file']
#                  file_name, file_extension = os.path.splitext(uploaded_file.name)
#                  existing_file = ResourceShare.objects.filter(
#                      file__icontains=f"{file_name}{file_extension}",
#                      department=department,
#                      batch=batch,
#                      course=course
#                  ).first()

#                  if existing_file:
#                      serializer.save(staff=self.request.user, file=existing_file.file)
#                  else:
#                      serializer.save(staff=self.request.user)
#              else:
#                  serializer.save(staff=self.request.user)
 

class ResourceShareCreateView(generics.CreateAPIView):
    serializer_class = ResourceShareSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]

    def perform_create(self, serializer):
        department = serializer.validated_data['department']
        batch = serializer.validated_data['batch']
        course = serializer.validated_data['course']
        title = serializer.validated_data['title']
        description = serializer.validated_data['description']

        existing_resources = ResourceShare.objects.filter(
            staff=self.request.user,
            title=title,
            description=description
        )

        if existing_resources.exists():
            return Response(
                {"detail": "You have already shared a resource with the same title and description."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if 'file' in serializer.validated_data:
            uploaded_file = serializer.validated_data['file']
            file_name, file_extension = os.path.splitext(uploaded_file.name)
            existing_file = ResourceShare.objects.filter(
                file__icontains=f"{file_name}{file_extension}",
                department=department,
                batch=batch,
                course=course
            ).first()

            if existing_file:
                resource = serializer.save(staff=self.request.user, file=existing_file.file)
            else:
                resource = serializer.save(staff=self.request.user)
        else:
            resource = serializer.save(staff=self.request.user)

        users_in_department = User.objects.filter(profile__department=department)
        for user in users_in_department:
            create_notification(user, 'new_resource', f"A new resource '{resource.title}' has been shared.")

        return Response(serializer.data, status=status.HTTP_201_CREATED)
                 
class AccessResourceShareView(generics.ListAPIView):
    serializer_class = ResourceShareAccessSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        student_profile =  getattr(self.request.user, 'student_profile', None)
        if not student_profile:
            logging.error("Student profile not found.")
            return ResourceShare.objects.none()
        department = student_profile.department
        
        return ResourceShare.objects.filter(department=department)