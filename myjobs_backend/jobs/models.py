# jobs/models.py
from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator
from django.conf import settings

User = get_user_model()

class Job(models.Model):
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('paused', 'Paused'),
        ('closed', 'Closed'),
    ]
    
    JOB_TYPE_CHOICES = [
        ('onsite', 'Onsite'),
        ('remote', 'Remote'),
        ('full_time', 'Full Time'),
        ('part_time', 'Part Time'),
    ]
    
    # Core job information
    title = models.CharField(max_length=255)
    department = models.CharField(max_length=255, null=True, blank=True)
    job_type = models.CharField(max_length=20,choices=JOB_TYPE_CHOICES,null=True,blank=True)
    description = models.TextField()
    location = models.CharField(max_length=255)
    experience_years = models.PositiveIntegerField(default=0, validators=[MinValueValidator(0)])
    
    # Job requirements
    course = models.CharField(max_length=255)  # Relevant course/degree
    eligibility = models.TextField()  # Eligibility criteria
    skills_required = models.TextField()  # Comma-separated skills
    
    # Job metadata
    deadline = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    pdf_document = models.FileField(upload_to='job_documents/', null=True, blank=True)
    
    # Relationships
    posted_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posted_jobs')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Job'
        verbose_name_plural = 'Jobs'
    
    def __str__(self):
        return f"{self.title} - {self.posted_by.email}"
    
    @property
    def is_active(self):
        """Check if job is still accepting applications"""
        from django.utils import timezone
        return self.status == 'open' and self.deadline >= timezone.now().date()
    
    @property
    def days_until_deadline(self):
        """Calculate days remaining until deadline"""
        from django.utils import timezone
        if self.deadline:
            delta = self.deadline - timezone.now().date()
            return delta.days if delta.days > 0 else 0
        return None

class JobApplication(models.Model):
    """For future implementation - job applications tracking"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('reviewing', 'Under Review'),
        ('shortlisted', 'Shortlisted'),
        ('rejected', 'Rejected'),
        ('hired', 'Hired'),
    ]
    
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='applications')
    applicant = models.ForeignKey(User, on_delete=models.CASCADE, related_name='job_applications')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    cover_letter = models.TextField(blank=True)
    resume = models.FileField(upload_to='application_resumes/', null=True, blank=True)
    
    # Timestamps
    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-applied_at']
        unique_together = ['job', 'applicant']  # One application per job per user
    
    def __str__(self):
        return f"{self.applicant.email} - {self.job.title}"

class JobStatusHistory(models.Model):
    """Track status changes for audit trail"""
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='status_history')
    old_status = models.CharField(max_length=20, blank=True)
    new_status = models.CharField(max_length=20)
    changed_by = models.ForeignKey(User, on_delete=models.CASCADE)
    changed_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-changed_at']
    
    def __str__(self):
        return f"{self.job.title} - {self.old_status} → {self.new_status}"

class SavedJob(models.Model):
    """Model for faculty to save jobs they're interested in"""
    faculty = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saved_jobs')
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='saved_by')
    saved_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['faculty', 'job']  # A faculty can only save a job once
        ordering = ['-saved_at']
    
    def __str__(self):
        return f"{self.faculty.email} saved {self.job.title}"
