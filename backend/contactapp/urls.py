from contactapp.views import FeedbackCreateView
from django.urls import path
from .views import SendMediaMessageView, GetMessagesView, UpdateMessageView, DeleteMessageView, MarkMessageViewedView ,FeedbackFetchView , FeedbackDeleteView

urlpatterns = [
    path("feedback/" ,FeedbackCreateView.as_view(), name="feedback-create"),
    path("feedback-list/", FeedbackFetchView.as_view(), name="feedback-list-view"),
    path("delete-feedback/<int:pk>/", FeedbackDeleteView.as_view(), name ="delete-feedback"),
    path('send-media/', SendMediaMessageView.as_view(), name='send-media'),
    path('<int:friend_id>/', GetMessagesView.as_view(), name='get-messages'),
    path('update/<int:message_id>/', UpdateMessageView.as_view(), name='update-message'),
    path('delete/<int:message_id>/', DeleteMessageView.as_view(), name='delete-message'),
    path('view/', MarkMessageViewedView.as_view(), name='mark-viewed'),
    
]
