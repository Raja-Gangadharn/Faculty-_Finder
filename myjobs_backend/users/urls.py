# users/urls.py
from django.urls import path
from .views import (
    FacultyRegistrationView, RecruiterRegistrationView, LoginView,
    FacultyProfileDetail, RecruiterProfileDetail,
    EducationListCreateView, EducationDetailView,
    TranscriptListCreateView, TranscriptDetailView,
    CertificateListCreateView, CertificateDetailView,
    MembershipListCreateView, MembershipDetailView,
    ExperienceListCreateView, ExperienceDetailView,
    SkillListCreateView, SkillDetailView,
    PresentationListCreateView, PresentationDetailView,
    DocumentListCreateView, DocumentDetailView,
    FacultySearchView, RecruiterFacultyDetailView,
)
from .views_dropdowns import DegreeListView, CollegeListView, DepartmentListView

urlpatterns = [
    # auth + registration
    path('faculty/register/', FacultyRegistrationView.as_view(), name='faculty_register'),
    path('recruiter/register/', RecruiterRegistrationView.as_view(), name='recruiter_register'),
    path('login/', LoginView.as_view(), name='custom_login'),

    # Basic profile endpoints
    path('faculty/profile/', FacultyProfileDetail.as_view(), name='faculty-profile'),
    path('recruiter/profile/', RecruiterProfileDetail.as_view(), name='recruiter-profile'),

    # recruiter aggregated faculty search
    path('recruiter/faculty-search/', FacultySearchView.as_view(), name='recruiter-faculty-search'),

    # recruiter faculty full detail by user id
    path('recruiter/faculty/<int:user_id>/details/', RecruiterFacultyDetailView.as_view(), name='recruiter-faculty-detail'),

    # lookups
    path('api/colleges/', CollegeListView.as_view(), name='colleges-list'),
    path('api/degrees/', DegreeListView.as_view(), name='degrees-list'),
    path('api/departments/', DepartmentListView.as_view(), name='departments-list'),
]

# --- duplicate/alias endpoints for frontend convenience ---
# The frontend (facultyService.js) calls top-level endpoints like /api/skills/, /api/presentations/, /api/certificates/
# We expose both the 'faculty/profile/...' and top-level '.../' routes and point them to the same views.
extra_patterns = [
    # Educations
    path('faculty/profile/educations/', EducationListCreateView.as_view(), name='faculty-educations'),
    path('faculty/profile/educations/<int:pk>/', EducationDetailView.as_view(), name='faculty-education-detail'),
    path('educations/', EducationListCreateView.as_view(), name='educations-list'),
    path('educations/<int:pk>/', EducationDetailView.as_view(), name='educations-detail'),

    # Transcripts
    path('faculty/profile/transcripts/', TranscriptListCreateView.as_view(), name='faculty-transcripts'),
    path('faculty/profile/transcripts/<int:pk>/', TranscriptDetailView.as_view(), name='faculty-transcript-detail'),
    path('transcripts/', TranscriptListCreateView.as_view(), name='transcripts-list'),
    path('transcripts/<int:pk>/', TranscriptDetailView.as_view(), name='transcripts-detail'),

    # Certificates
    path('faculty/profile/certificates/', CertificateListCreateView.as_view(), name='faculty-certificates'),
    path('faculty/profile/certificates/<int:pk>/', CertificateDetailView.as_view(), name='faculty-certificate-detail'),
    path('certificates/', CertificateListCreateView.as_view(), name='certificates-list'),
    path('certificates/<int:pk>/', CertificateDetailView.as_view(), name='certificates-detail'),

    # Memberships
    path('api/memberships/', MembershipListCreateView.as_view(), name='api-memberships-list'),
    path('api/memberships/<int:pk>/', MembershipDetailView.as_view(), name='api-memberships-detail'),
    path('faculty/profile/memberships/', MembershipListCreateView.as_view(), name='faculty-memberships'),
    path('faculty/profile/memberships/<int:pk>/', MembershipDetailView.as_view(), name='faculty-membership-detail'),
    path('memberships/', MembershipListCreateView.as_view(), name='memberships-list'),
    path('memberships/<int:pk>/', MembershipDetailView.as_view(), name='memberships-detail'),

    # Experiences
    path('faculty/profile/experiences/', ExperienceListCreateView.as_view(), name='faculty-experiences'),
    path('faculty/profile/experiences/<int:pk>/', ExperienceDetailView.as_view(), name='faculty-experience-detail'),
    path('experiences/', ExperienceListCreateView.as_view(), name='experiences-list'),
    path('experiences/<int:pk>/', ExperienceDetailView.as_view(), name='experiences-detail'),

    # Skills
    path('faculty/profile/skills/', SkillListCreateView.as_view(), name='faculty-skills'),
    path('faculty/profile/skills/<int:pk>/', SkillDetailView.as_view(), name='faculty-skill-detail'),
    path('skills/', SkillListCreateView.as_view(), name='skills-list'),
    path('skills/<int:pk>/', SkillDetailView.as_view(), name='skills-detail'),

    # Presentations
    path('faculty/profile/presentations/', PresentationListCreateView.as_view(), name='faculty-presentations'),
    path('faculty/profile/presentations/<int:pk>/', PresentationDetailView.as_view(), name='faculty-presentation-detail'),
    path('presentations/', PresentationListCreateView.as_view(), name='presentations-list'),
    path('presentations/<int:pk>/', PresentationDetailView.as_view(), name='presentations-detail'),

    # Documents
    path('faculty/profile/documents/', DocumentListCreateView.as_view(), name='faculty-documents'),
    path('faculty/profile/documents/<int:pk>/', DocumentDetailView.as_view(), name='faculty-document-detail'),
    path('documents/', DocumentListCreateView.as_view(), name='documents-list'),
    path('documents/<int:pk>/', DocumentDetailView.as_view(), name='documents-detail'),
    
]

urlpatterns += extra_patterns
