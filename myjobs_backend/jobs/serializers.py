from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Job, JobApplication, JobStatusHistory

User = get_user_model()

class JobSerializer(serializers.ModelSerializer):
    """Serializer for Job model"""
    posted_by_name = serializers.SerializerMethodField()
    is_active = serializers.ReadOnlyField()
    days_until_deadline = serializers.ReadOnlyField()
    
    class Meta:
        model = Job
        fields = [
            'id', 'title', 'department', 'description', 'location', 'job_type', 
            'experience_years', 'course', 'eligibility', 'skills_required', 
            'deadline', 'status', 'pdf_document', 'posted_by', 'posted_by_name',
            'created_at', 'updated_at', 'is_active', 'days_until_deadline'
        ]
        read_only_fields = ['posted_by', 'created_at', 'updated_at']
    
    def get_posted_by_name(self, obj):
        """Get the name of the user who posted the job"""
        try:
            profile = obj.posted_by.recruiterprofile
            return f"{profile.first_name} {profile.last_name}".strip()
        except:
            return obj.posted_by.email
    
    def create(self, validated_data):
        """Create job with authenticated user as posted_by"""
        request = self.context.get('request')
        if request and request.user:
            validated_data['posted_by'] = request.user
        return super().create(validated_data)
    
    def validate_deadline(self, value):
        """Validate that deadline is in the future"""
        from django.utils import timezone
        if value <= timezone.now().date():
            raise serializers.ValidationError("Deadline must be in the future.")
        return value
    
    def validate_experience_years(self, value):
        """Validate experience years"""
        if value < 0:
            raise serializers.ValidationError("Experience years cannot be negative.")
        return value

class JobCreateSerializer(serializers.ModelSerializer):
    """Simplified serializer for job creation"""
    class Meta:
        model = Job
        fields = [
            'title','department','job_type', 'description', 'location', 'experience_years', 'course', 
            'eligibility', 'skills_required', 'deadline', 'pdf_document'
        ]
    
    def validate_deadline(self, value):
        """Validate that deadline is in the future"""
        from django.utils import timezone
        if value <= timezone.now().date():
            raise serializers.ValidationError("Deadline must be in the future.")
        return value

class JobUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating job status and other fields"""
    class Meta:
        model = Job
        fields = ['title', 'description', 'location', 'experience_years', 'course', 
                 'eligibility', 'skills_required', 'deadline', 'status', 'pdf_document']
    
    def validate_deadline(self, value):
        """Validate that deadline is in the future"""
        from django.utils import timezone
        if value <= timezone.now().date():
            raise serializers.ValidationError("Deadline must be in the future.")
        return value

class JobStatusUpdateSerializer(serializers.Serializer):
    """Serializer for updating only job status"""
    status = serializers.ChoiceField(choices=Job.STATUS_CHOICES)
    notes = serializers.CharField(required=False, allow_blank=True)
    
    def validate_status(self, value):
        """Validate status choice"""
        if value not in dict(Job.STATUS_CHOICES):
            raise serializers.ValidationError("Invalid status choice.")
        return value

class JobApplicationSerializer(serializers.ModelSerializer):
    """Serializer for Job Applications (for future use)"""
    applicant_name = serializers.SerializerMethodField()
    job_title = serializers.CharField(source='job.title', read_only=True)
    
    class Meta:
        model = JobApplication
        fields = [
            'id', 'job', 'job_title', 'applicant', 'applicant_name', 'status',
            'cover_letter', 'resume', 'applied_at', 'updated_at'
        ]
        read_only_fields = ['applicant', 'applied_at', 'updated_at']
    
    def get_applicant_name(self, obj):
        """Get the name of the applicant"""
        try:
            profile = obj.applicant.facultyprofile
            return f"{profile.first_name} {profile.last_name}".strip()
        except:
            return obj.applicant.email

class JobStatusHistorySerializer(serializers.ModelSerializer):
    """Serializer for Job Status History"""
    changed_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = JobStatusHistory
        fields = [
            'id', 'job', 'old_status', 'new_status', 'changed_by', 
            'changed_by_name', 'changed_at', 'notes'
        ]
        read_only_fields = ['changed_by', 'changed_at']
    
    def get_changed_by_name(self, obj):
        """Get the name of the user who made the change"""
        try:
            if obj.changed_by.is_recruiter:
                profile = obj.changed_by.recruiterprofile
                return f"{profile.first_name} {profile.last_name}".strip()
            else:
                profile = obj.changed_by.facultyprofile
                return f"{profile.first_name} {profile.last_name}".strip()
        except:
            return obj.changed_by.email
