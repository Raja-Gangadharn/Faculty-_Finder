from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Q

from .models import Job, JobApplication, JobStatusHistory, SavedJob
from .serializers import (
    JobSerializer, JobCreateSerializer, JobUpdateSerializer, 
    JobStatusUpdateSerializer, JobApplicationSerializer, 
    JobStatusHistorySerializer, SavedJobSerializer
)

class IsRecruiterOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow recruiters to edit their own jobs.
    """
    def has_permission(self, request, view):
        # Authenticated users can view
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        
        # Only recruiters can create/edit
        return request.user and request.user.is_authenticated and request.user.is_recruiter
    
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any authenticated user
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        
        # Write permissions are only allowed to the job owner
        return obj.posted_by == request.user

class JobListCreateView(generics.ListCreateAPIView):
    """
    GET: List all jobs (with filtering for recruiter's own jobs)
    POST: Create a new job (recruiters only)
    """
    serializer_class = JobSerializer
    permission_classes = [IsRecruiterOrReadOnly]
    
    def get_faculty_departments(self, faculty_user):
        """
        Get all departments associated with a faculty user from their transcripts and courses
        """
        try:
            faculty_profile = faculty_user.facultyprofile
            departments = set()
            
            # Get departments from transcripts
            transcript_depts = faculty_profile.transcripts_list.filter(
                department__isnull=False
            ).values_list('department__name', flat=True)
            departments.update(transcript_depts)
            
            # Get departments from courses
            course_depts = faculty_profile.transcripts_list.filter(
                courses__department__isnull=False
            ).values_list('courses__department__name', flat=True)
            departments.update(course_depts)
            
            return list(departments)
        except:
            return []

    def get_queryset(self):
        """
        Filter jobs based on user type:
        - Recruiters: see only their own jobs
        - Faculty: see only jobs matching their departments from transcripts/courses
        - Others: see all active jobs
        """
        user = self.request.user
        if not user.is_authenticated:
            return Job.objects.none()
        
        if user.is_recruiter:
            # Recruiters see only their own jobs
            return Job.objects.filter(posted_by=user)
        elif user.is_faculty:
            # Faculty see only jobs matching their departments
            faculty_departments = self.get_faculty_departments(user)
            
            if not faculty_departments:
                # If no departments found, return empty queryset
                return Job.objects.none()
            
            # Filter by department and active status
            return Job.objects.filter(
                Q(department__in=faculty_departments) &
                Q(status='open') & 
                Q(deadline__gte=timezone.now().date())
            )
        else:
            # Default: show all active jobs
            return Job.objects.filter(
                Q(status='open') & Q(deadline__gte=timezone.now().date())
            )
    
    def get_serializer_class(self):
        """Use different serializers for create vs list"""
        if self.request.method == 'POST':
            return JobCreateSerializer
        return JobSerializer
    
    def perform_create(self, serializer):
        """Set the posted_by field to the current user"""
        serializer.save(posted_by=self.request.user)

class JobDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET: Retrieve a job
    PUT/PATCH: Update a job (owner only)
    DELETE: Delete a job (owner only)
    """
    serializer_class = JobSerializer
    permission_classes = [IsRecruiterOrReadOnly]
    
    def get_queryset(self):
        """Filter jobs based on user type"""
        user = self.request.user
        if not user.is_authenticated:
            return Job.objects.none()
        
        if user.is_recruiter:
            # Recruiters can access their own jobs
            return Job.objects.filter(posted_by=user)
        else:
            # Others can access all jobs
            return Job.objects.all()
    
    def get_serializer_class(self):
        """Use different serializers for update vs retrieve"""
        if self.request.method in ['PUT', 'PATCH']:
            return JobUpdateSerializer
        return JobSerializer

@api_view(['PATCH'])
@permission_classes([IsRecruiterOrReadOnly])
def update_job_status(request, job_id):
    """
    Update job status with audit trail
    """
    job = get_object_or_404(Job, id=job_id)
    
    # Check permission
    if job.posted_by != request.user:
        return Response(
            {'error': 'You can only update your own jobs'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    serializer = JobStatusUpdateSerializer(data=request.data)
    if serializer.is_valid():
        old_status = job.status
        new_status = serializer.validated_data['status']
        notes = serializer.validated_data.get('notes', '')
        
        # Update job status
        job.status = new_status
        job.save()
        
        # Create status history record
        JobStatusHistory.objects.create(
            job=job,
            old_status=old_status,
            new_status=new_status,
            changed_by=request.user,
            notes=notes
        )
        
        return Response({
            'message': 'Job status updated successfully',
            'old_status': old_status,
            'new_status': new_status
        })
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_jobs(request):
    """
    Get jobs posted by the current recruiter
    """
    if not request.user.is_recruiter:
        return Response(
            {'error': 'Only recruiters can access this endpoint'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    jobs = Job.objects.filter(posted_by=request.user)
    
    # Filter by status if provided
    status_filter = request.GET.get('status')
    if status_filter:
        jobs = jobs.filter(status=status_filter)
    
    serializer = JobSerializer(jobs, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def job_statistics(request):
    """
    Get job statistics for the current recruiter
    """
    if not request.user.is_recruiter:
        return Response(
            {'error': 'Only recruiters can access this endpoint'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    jobs = Job.objects.filter(posted_by=request.user)
    
    stats = {
        'total_jobs': jobs.count(),
        'open_jobs': jobs.filter(status='open').count(),
        'paused_jobs': jobs.filter(status='paused').count(),
        'closed_jobs': jobs.filter(status='closed').count(),
        'active_jobs': jobs.filter(
            status='open', 
            deadline__gte=timezone.now().date()
        ).count(),
        'expired_jobs': jobs.filter(
            status='open', 
            deadline__lt=timezone.now().date()
        ).count(),
    }
    
    return Response(stats)

# Future endpoints for job applications
class JobApplicationListCreateView(generics.ListCreateAPIView):
    """
    For future implementation: Handle job applications
    """
    serializer_class = JobApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        job_id = self.kwargs['job_id']
        return JobApplication.objects.filter(job_id=job_id)
    
    def perform_create(self, serializer):
        job_id = self.kwargs['job_id']
        job = get_object_or_404(Job, id=job_id)
        serializer.save(
            applicant=self.request.user,
            job=job
        )

# Saved Jobs endpoints
class SavedJobListCreateView(generics.ListCreateAPIView):
    """
    GET: List all saved jobs for the current faculty
    POST: Save a job
    """
    serializer_class = SavedJobSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Only return saved jobs for the current user"""
        return SavedJob.objects.filter(faculty=self.request.user)
    
    def perform_create(self, serializer):
        """Set the faculty to the current user"""
        serializer.save(faculty=self.request.user)

@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def unsave_job(request, job_id):
    """
    Remove a job from saved jobs
    """
    try:
        saved_job = SavedJob.objects.get(
            faculty=request.user,
            job_id=job_id
        )
        saved_job.delete()
        return Response({'message': 'Job removed from saved jobs'}, status=status.HTTP_200_OK)
    except SavedJob.DoesNotExist:
        return Response(
            {'error': 'Job not found in saved jobs'}, 
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def is_job_saved(request, job_id):
    """
    Check if a job is saved by the current user
    """
    is_saved = SavedJob.objects.filter(
        faculty=request.user,
        job_id=job_id
    ).exists()
    
    return Response({'is_saved': is_saved})
