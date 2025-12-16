# users/admin.py
from django.contrib import admin
from .models import (
    CustomUser, FacultyProfile, RecruiterProfile,
    College, Degree, Department,
    Education, Transcript, Course,
    Certificate, Membership, Experience,
    Skill, Presentation, Document
)

# Register models
admin.site.register(CustomUser)
admin.site.register(FacultyProfile)
admin.site.register(RecruiterProfile)

admin.site.register(College)
admin.site.register(Degree)
admin.site.register(Department)

admin.site.register(Education)
admin.site.register(Transcript)
admin.site.register(Course)
admin.site.register(Certificate)
admin.site.register(Membership)
admin.site.register(Experience)
admin.site.register(Skill)
admin.site.register(Presentation)
admin.site.register(Document)
