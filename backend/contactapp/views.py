from django.shortcuts import render
from rest_framework import generics
from .models import Feedback
from .serializers import FeedbackSerializers
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny

class FeedbackCreateview(generics.CreateAPIView):
    queryset= Feedback.objects.all()
    serializer_class = FeedbackSerializers
    permission_classes = [AllowAny]