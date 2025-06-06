
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView



urlpatterns = [
 path("api-auth/", include("rest_framework.urls")),
 path("users/", include("users.urls")),
 path("contactapp/", include("contactapp.urls")),
 path("events/", include("events.urls")),
 path("discussion_forum/", include("discussion_forum.urls")),
]
if settings.DEBUG: 
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
