from contactapp.views import FeedbackCreateview
from django.urls import path

urlpatterns = [
    path("feedback/" ,FeedbackCreateview.as_view(), name="feedback-create"),
]
