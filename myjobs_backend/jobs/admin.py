from django.contrib import admin
from .models import Job, JobApplication, JobStatusHistory

@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'department', 'posted_by', 'location', 'job_type', 'status', 
        'deadline', 'created_at', 'is_active'
    ]
    list_filter = ['status', 'job_type', 'created_at', 'deadline']
    search_fields = ['title', 'description', 'location', 'department', 'posted_by__email']
    readonly_fields = ['created_at', 'updated_at', 'is_active', 'days_until_deadline']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'department', 'description', 'location', 'job_type', 'posted_by')
        }),
        ('Requirements', {
            'fields': ('experience_years', 'course', 
                      'eligibility', 'skills_required')
        }),
        ('Job Details', {
            'fields': ('deadline', 'status', 'pdf_document')
        }),
        ('System Information', {
            'fields': ('created_at', 'updated_at', 'is_active', 'days_until_deadline'),
            'classes': ('collapse',)
        }),
    )
    
    def is_active(self, obj):
        return obj.is_active
    is_active.boolean = True
    is_active.short_description = 'Active'
    
    def days_until_deadline(self, obj):
        days = obj.days_until_deadline
        if days is not None:
            return f"{days} days" if days >= 0 else "Expired"
        return "N/A"
    days_until_deadline.short_description = 'Days Until Deadline'

@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = [
        'job', 'applicant', 'status', 'applied_at', 'updated_at'
    ]
    list_filter = ['status', 'applied_at', 'job__status']
    search_fields = ['job__title', 'applicant__email', 'cover_letter']
    readonly_fields = ['applied_at', 'updated_at']
    
    fieldsets = (
        ('Application Details', {
            'fields': ('job', 'applicant', 'status')
        }),
        ('Application Content', {
            'fields': ('cover_letter', 'resume')
        }),
        ('Timestamps', {
            'fields': ('applied_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

@admin.register(JobStatusHistory)
class JobStatusHistoryAdmin(admin.ModelAdmin):
    list_display = [
        'job', 'old_status', 'new_status', 'changed_by', 'changed_at'
    ]
    list_filter = ['new_status', 'old_status', 'changed_at']
    search_fields = ['job__title', 'changed_by__email', 'notes']
    readonly_fields = ['changed_at']
    
    fieldsets = (
        ('Status Change', {
            'fields': ('job', 'old_status', 'new_status', 'changed_by')
        }),
        ('Additional Information', {
            'fields': ('notes', 'changed_at')
        }),
    )
