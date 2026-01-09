from django.urls import path
from .views import (
    JobListCreateView, JobDetailView, update_job_status, 
    my_jobs, job_statistics, JobApplicationListCreateView
)

urlpatterns = [
    # Job CRUD endpoints
    path('', JobListCreateView.as_view(), name='job-list-create'),
    path('<int:pk>/', JobDetailView.as_view(), name='job-detail'),
    
    # Job status management
    path('<int:job_id>/status/', update_job_status, name='update-job-status'),
    
    # Recruiter-specific endpoints
    path('my/', my_jobs, name='my-jobs'),
    path('statistics/', job_statistics, name='job-statistics'),
    
    # Future: Job applications
    path('<int:job_id>/applications/', JobApplicationListCreateView.as_view(), name='job-applications'),
]
