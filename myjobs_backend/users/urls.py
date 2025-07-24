from django.urls import path
from .views import FacultyRegistrationView, RecruiterRegistrationView, LoginView

urlpatterns = [
    path('faculty/register/', FacultyRegistrationView.as_view(), name='faculty_register'),
    path('recruiter/register/', RecruiterRegistrationView.as_view(), name='recruiter_register'),
    path('login/', LoginView.as_view(), name='custom_login'),
]
