# users/models.py
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models
from .managers import CustomUserManager
from django.core.validators import MinValueValidator, MaxValueValidator
from django.conf import settings

# -------------------------
# User & Profile models
# -------------------------
class CustomUser(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    is_faculty = models.BooleanField(default=False)
    is_recruiter = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    def __str__(self):
        return self.email

class FacultyProfile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    # Basic Information from UI
    title = models.CharField(max_length=20, blank=True, default='')         # e.g., Dr., Prof.
    first_name = models.CharField(max_length=50, blank=True)
    last_name = models.CharField(max_length=50, blank=True)
    phone = models.CharField(max_length=30, blank=True)
    dob = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=20, blank=True)
    state = models.CharField(max_length=100, blank=True)
    city = models.CharField(max_length=100, blank=True)
    linkedin = models.CharField(max_length=255, blank=True)
    # Work preference: frontend allows multiple selected options -> store as JSON
    work_preference = models.JSONField(default=list, blank=True)
    profile_photo = models.FileField(upload_to='profile_photos/', null=True, blank=True)

    # previously existing fields
    resume = models.FileField(upload_to='resumes/', null=True, blank=True)
    transcripts = models.FileField(upload_to='transcripts/', null=True, blank=True)

    def __str__(self):
        return f"{self.user.email} - FacultyProfile"

class RecruiterProfile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    college = models.CharField(max_length=100, default='Unknown College')

    def __str__(self):
        return f"{self.user.email} - RecruiterProfile"

# -------------------------
# Lookup models (admin-managed)
# -------------------------
class College(models.Model):
    name = models.CharField(max_length=255, unique=True)
    def __str__(self): return self.name

class Degree(models.Model):
    name = models.CharField(max_length=255, unique=True)
    def __str__(self): return self.name

class Department(models.Model):
    name = models.CharField(max_length=255, unique=True)
    def __str__(self): return self.name

# -------------------------
# Repeatable child models
# -------------------------
class Education(models.Model):
    profile = models.ForeignKey(FacultyProfile, on_delete=models.CASCADE, related_name='educations')
    degree = models.CharField(max_length=255)
    specialization = models.CharField(max_length=255, blank=True)
    university = models.CharField(max_length=255)
    program = models.CharField(max_length=255, blank=True)
    year = models.PositiveIntegerField(null=True, blank=True, validators=[MinValueValidator(1900), MaxValueValidator(2100)])
    is_research = models.BooleanField(default=False)
    dissertation_title = models.CharField(max_length=512, blank=True)
    abstract = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self): return f"{self.degree} - {self.university}"



class Transcript(models.Model):
    profile = models.ForeignKey(FacultyProfile, on_delete=models.CASCADE, related_name='transcripts_list')
    DEGREE_LEVELS = [
        ("Master's", "Master's"),
        ('Doctorate', 'Doctorate'),
    ]
    degree_level = models.CharField(max_length=20, choices=DEGREE_LEVELS, null=True, blank=True)
    degree = models.CharField(max_length=255)
    college = models.CharField(max_length=255)
    major = models.CharField(max_length=255, blank=True)
    year_completed = models.PositiveIntegerField(null=True, blank=True, validators=[MinValueValidator(1900), MaxValueValidator(2100)])
    department = models.ForeignKey(Department, null=True, blank=True, on_delete=models.SET_NULL, related_name='transcripts')
    file = models.FileField(upload_to='transcripts/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        ordering = ['-year_completed', 'degree_level', 'degree']

    def __str__(self):
        return f"{self.degree} - {self.college}"


class Course(models.Model):
    transcript = models.ForeignKey(Transcript, on_delete=models.CASCADE, related_name='courses')
    code = models.CharField(max_length=50, blank=True)
    name = models.CharField(max_length=255)
    credits = models.FloatField(null=True, blank=True)
    grade = models.CharField(max_length=50, blank=True)
    department = models.ForeignKey(Department, null=True, blank=True, on_delete=models.SET_NULL, related_name='courses')
    created_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.code} - {self.name}"

class Certificate(models.Model):
    profile = models.ForeignKey(FacultyProfile, on_delete=models.CASCADE, related_name='certificates')
    name = models.CharField(max_length=255)
    number = models.CharField(max_length=255, blank=True)
    provider = models.CharField(max_length=255, blank=True)
    issue_date = models.DateField(null=True, blank=True)
    expiry_date = models.DateField(null=True, blank=True)
    file = models.FileField(upload_to='certificates/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name

class Membership(models.Model):
    profile = models.ForeignKey(FacultyProfile, on_delete=models.CASCADE, related_name='memberships')
    organization = models.CharField(max_length=255)
    membership_id = models.CharField(max_length=255, blank=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    is_current = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-start_date']
    
    def __str__(self): 
        return self.organization

class Experience(models.Model):
    TYPE_CHOICES = (('academic','academic'),('non_academic','non_academic'),('overall','overall'))
    profile = models.ForeignKey(FacultyProfile, on_delete=models.CASCADE, related_name='experiences')
    exp_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='academic')
    institution_or_company = models.CharField(max_length=255)
    position = models.CharField(max_length=255)
    responsibilities = models.TextField(blank=True)  # store newline-separated or JSON string
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    is_current = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self): return f"{self.position} @ {self.institution_or_company}"

class Skill(models.Model):
    profile = models.ForeignKey(FacultyProfile, on_delete=models.CASCADE, related_name='skills')
    skill = models.CharField(max_length=255)
    proficiency = models.CharField(max_length=50, default='Beginner')
    def __str__(self): return self.skill

class Presentation(models.Model):
    profile = models.ForeignKey(FacultyProfile, on_delete=models.CASCADE, related_name='presentations')
    title = models.CharField(max_length=255)
    date = models.DateField(null=True, blank=True)
    venue = models.CharField(max_length=255, blank=True)
    def __str__(self): return self.title

class Document(models.Model):
    profile = models.ForeignKey(FacultyProfile, on_delete=models.CASCADE, related_name='documents')
    name = models.CharField(max_length=255)
    doc_type = models.CharField(max_length=100, blank=True)
    file = models.FileField(upload_to='documents/', null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    size = models.FloatField(null=True, blank=True)  # MB if desired
    def __str__(self): return self.name
