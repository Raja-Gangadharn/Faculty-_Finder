# users/views.py
import json
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status, generics, permissions
from django.contrib.auth import authenticate, get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from .email_utils import send_welcome_email, send_admin_notification

from .serializers import (
    FacultyRegistrationSerializer, RecruiterRegistrationSerializer,
    FacultyProfileSerializer, RecruiterProfileSerializer,
    EducationSerializer, TranscriptSerializer, CourseSerializer,
    CertificateSerializer, MembershipSerializer, ExperienceSerializer,
    SkillSerializer, PresentationSerializer, DocumentSerializer,
    CollegeSerializer, DegreeSerializer, DepartmentSerializer
)
from .models import (
    FacultyProfile, RecruiterProfile,
    Education, Transcript, Course,
    Certificate, Membership, Experience,
    Skill, Presentation, Document,
    College, Degree, Department
)
from .permissions import IsOwnerOrReadOnly, IsApplicant, IsRecruiter

User = get_user_model()

# -----------------------
# Helpers
# -----------------------
def _normalize_work_pref_in_request_data(data):
    """
    Accept both list or JSON string or comma-separated string in incoming request data for 'work_preference'.
    Returns a copy of data (not mutating original) with 'work_preference' normalized to a python list if present.
    """
    if hasattr(data, 'copy'):
        d = data.copy()
    else:
        d = dict(data)
    for key in ('work_preference', 'workPreference'):
        if key in d:
            val = d.get(key)
            if val is None:
                d['work_preference'] = []
                break
            if isinstance(val, list):
                d['work_preference'] = val
                break
            if isinstance(val, str):
                try:
                    parsed = json.loads(val)
                    if isinstance(parsed, list):
                        d['work_preference'] = parsed
                        break
                except Exception:
                    # fallback: comma separated
                    d['work_preference'] = [x.strip() for x in val.split(',') if x.strip()]
                    break
            # otherwise keep as-is
            d['work_preference'] = val
            break
    return d

# -----------------------
# Existing registration & login views
# -----------------------
class FacultyRegistrationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        data = _normalize_work_pref_in_request_data(request.data)
        serializer = FacultyRegistrationSerializer(data=data)
        if serializer.is_valid():
            try:
                user = serializer.save()
                
                # Get the faculty profile to access first_name and last_name
                faculty_profile = user.facultyprofile
                
                # Send welcome email to faculty
                send_welcome_email(
                    user_email=user.email,
                    first_name=faculty_profile.first_name
                )
                
                # Send notification to admin
                send_admin_notification(
                    user_email=user.email,
                    first_name=faculty_profile.first_name,
                    last_name=faculty_profile.last_name
                )
                
                return Response({
                    "message": "Faculty registered successfully. Please check your email for confirmation.",
                    "user_id": user.id,
                    "email": user.email,
                    "is_faculty": user.is_faculty,
                }, status=status.HTTP_201_CREATED)
                
            except Exception as e:
                # Log the error but don't expose it to the user
                print(f"Error sending emails: {str(e)}")
                return Response(
                    {"message": "Registration successful, but there was an issue sending the confirmation email. Please contact support."},
                    status=status.HTTP_201_CREATED
                )
                
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RecruiterRegistrationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RecruiterRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                "message": "Recruiter registered successfully",
                "user_id": user.id,
                "email": user.email,
                "is_recruiter": user.is_recruiter,
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"detail": "Invalid email"}, status=status.HTTP_401_UNAUTHORIZED)

        user = authenticate(request, username=user.email, password=password)

        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                "message": "Login successful",
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "is_faculty": user.is_faculty,
                    "is_recruiter": user.is_recruiter,
                },
                "token": {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                }
            }, status=status.HTTP_200_OK)
        else:
            return Response({"detail": "Invalid password"}, status=status.HTTP_401_UNAUTHORIZED)

# -----------------------
# Faculty / Recruiter profile detail views (basic)
# -----------------------
class FacultyProfileDetail(generics.RetrieveUpdateAPIView):
    serializer_class = FacultyProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsApplicant, IsOwnerOrReadOnly]

    def get_object(self):
        profile, _ = FacultyProfile.objects.get_or_create(
            user=self.request.user,
            defaults={'first_name': '', 'last_name': '', 'work_preference': []}
        )
        self.check_object_permissions(self.request, profile)
        return profile

    def update(self, request, *args, **kwargs):
        # normalize work_preference from multipart/form-data if it's a JSON string
        data = _normalize_work_pref_in_request_data(request.data)
        # use serializer with partial=True so frontend can update only some fields
        serializer = self.get_serializer(self.get_object(), data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

class RecruiterProfileDetail(generics.RetrieveUpdateAPIView):
    serializer_class = RecruiterProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsRecruiter, IsOwnerOrReadOnly]

    def get_object(self):
        profile, _ = RecruiterProfile.objects.get_or_create(
            user=self.request.user,
            defaults={'first_name': '', 'last_name': '', 'college': 'Unknown College'}
        )
        self.check_object_permissions(self.request, profile)
        return profile

# -----------------------
# Lookup list (read-only)
# -----------------------
class CollegeListView(generics.ListAPIView):
    queryset = College.objects.all().order_by('name')
    serializer_class = CollegeSerializer
    permission_classes = [permissions.AllowAny]

class DegreeListView(generics.ListAPIView):
    queryset = Degree.objects.all().order_by('name')
    serializer_class = DegreeSerializer
    permission_classes = [permissions.AllowAny]

class DepartmentListView(generics.ListAPIView):
    queryset = Department.objects.all().order_by('name')
    serializer_class = DepartmentSerializer
    permission_classes = [permissions.AllowAny]

# -----------------------
# Education endpoints
# -----------------------
class EducationListCreateView(generics.ListCreateAPIView):
    serializer_class = EducationSerializer
    permission_classes = [permissions.IsAuthenticated, IsApplicant]

    def get_queryset(self):
        profile = FacultyProfile.objects.filter(user=self.request.user).first()
        return profile.educations.all().order_by('-created_at') if profile else Education.objects.none()

    def perform_create(self, serializer):
        profile, _ = FacultyProfile.objects.get_or_create(user=self.request.user)
        serializer.save(profile=profile)

class EducationDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Education.objects.all()
    serializer_class = EducationSerializer
    permission_classes = [permissions.IsAuthenticated, IsApplicant, IsOwnerOrReadOnly]

# -----------------------
# Transcript & nested courses
# -----------------------
# users/views.py — update TranscriptListCreateView and TranscriptDetailView

class TranscriptListCreateView(generics.ListCreateAPIView):
    serializer_class = TranscriptSerializer
    permission_classes = [permissions.IsAuthenticated, IsApplicant]

    def get_queryset(self):
        try:
            print(f"[DEBUG] Getting profile for user: {self.request.user.id} - {self.request.user.email}")
            # Get or create the faculty profile if it doesn't exist
            # Create a profile if missing; CustomUser does not have first_name/last_name fields
            profile, created = FacultyProfile.objects.get_or_create(
                user=self.request.user,
                defaults={
                    'first_name': '',
                    'last_name': ''
                }
            )
            if created:
                print(f"[DEBUG] Created new FacultyProfile for user {self.request.user.id}")
            else:
                print(f"[DEBUG] Found existing profile: {profile.id}")
                
            transcripts = Transcript.objects.filter(profile=profile).order_by('-created_at')
            print(f"[DEBUG] Found {transcripts.count()} transcripts")
            return transcripts
            
        except Exception as e:
            print(f"[ERROR] Error in get_queryset: {str(e)}")
            print(f"[ERROR] User: {self.request.user.id if hasattr(self.request, 'user') else 'No user'}")
            print(f"[ERROR] Request path: {self.request.path if hasattr(self.request, 'path') else 'No path'}")
            # Return an empty queryset instead of raising the exception
            return Transcript.objects.none()
    def create(self, request, *args, **kwargs):
        # copy and normalize incoming data (courses may be JSON string)
        data = request.data.copy()
        courses = data.get('courses')
        if courses and isinstance(courses, str):
            try:
                data['courses'] = json.loads(courses)
            except Exception:
                return Response({'detail': 'Invalid courses JSON'}, status=status.HTTP_400_BAD_REQUEST)

        # ensure profile exists
        profile, _ = FacultyProfile.objects.get_or_create(user=request.user)
        
        # Pass the profile in the serializer context
        serializer = self.get_serializer(data=data, context={'profile': profile, 'request': request})
        if not serializer.is_valid():
            # Return detailed errors for easier debugging
            print("[VALIDATION] Transcript create errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        # Save the instance and ensure nested Course creation runs inside serializer.create()
        instance = serializer.save()

        # Return serialized data for the created instance
        out_serializer = self.get_serializer(instance)
        headers = self.get_success_headers(out_serializer.data)
        return Response(out_serializer.data, status=status.HTTP_201_CREATED, headers=headers)


    # override perform_create not necessary since we call serializer.save(profile=profile)

class TranscriptDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Transcript.objects.all()
    serializer_class = TranscriptSerializer
    permission_classes = [permissions.IsAuthenticated, IsApplicant, IsOwnerOrReadOnly]

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        data = request.data.copy()
        courses = data.get('courses')
        if courses and isinstance(courses, str):
            try:
                data['courses'] = json.loads(courses)
            except Exception:
                return Response({'detail': 'Invalid courses JSON'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(instance, data=data, partial=partial)
        if not serializer.is_valid():
            print("[VALIDATION] Transcript update errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        self.perform_update(serializer)
        return Response(serializer.data)


# -----------------------
# Certificate, Membership, Experience, Skills, Presentation, Document
# -----------------------
class CertificateListCreateView(generics.ListCreateAPIView):
    serializer_class = CertificateSerializer
    permission_classes = [permissions.IsAuthenticated, IsApplicant]
    def get_queryset(self):
        profile = FacultyProfile.objects.filter(user=self.request.user).first()
        return profile.certificates.all().order_by('-created_at') if profile else Certificate.objects.none()
    def perform_create(self, serializer):
        profile, _ = FacultyProfile.objects.get_or_create(user=self.request.user)
        serializer.save(profile=profile)

class CertificateDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Certificate.objects.all()
    serializer_class = CertificateSerializer
    permission_classes = [permissions.IsAuthenticated, IsApplicant, IsOwnerOrReadOnly]

class MembershipListCreateView(generics.ListCreateAPIView):
    serializer_class = MembershipSerializer
    permission_classes = [permissions.IsAuthenticated, IsApplicant]
    
    def get_queryset(self):
        try:
            print(f"[DEBUG] Getting memberships for user: {self.request.user.email}")
            
            # Get or create the profile
            try:
                profile = FacultyProfile.objects.get(user=self.request.user)
                print(f"[DEBUG] Found profile: {profile.id}")
            except FacultyProfile.DoesNotExist:
                print("[DEBUG] Profile does not exist, creating...")
                profile = FacultyProfile.objects.create(user=self.request.user)
                print(f"[DEBUG] Created new profile: {profile.id}")
            
            # Get memberships
            memberships = profile.memberships.all().order_by('-start_date')
            print(f"[DEBUG] Found {memberships.count()} memberships")
            return memberships
            
        except Exception as e:
            import traceback
            error_msg = f"Error in get_queryset: {str(e)}\n{traceback.format_exc()}"
            print(f"[ERROR] {error_msg}")
            return Membership.objects.none()
    
    def perform_create(self, serializer):
        try:
            print(f"[DEBUG] Creating membership for user: {self.request.user.email}")
            profile = FacultyProfile.objects.get(user=self.request.user)
            print(f"[DEBUG] Using profile: {profile.id}")
            instance = serializer.save(profile=profile)
            print(f"[DEBUG] Created membership: {instance.id}")
        except Exception as e:
            import traceback
            error_msg = f"Error in perform_create: {str(e)}\n{traceback.format_exc()}"
            print(f"[ERROR] {error_msg}")
            raise
    
    def handle_exception(self, exc):
        import traceback
        error_details = {
            'error': str(exc),
            'traceback': traceback.format_exc(),
            'user': str(self.request.user),
            'method': self.request.method,
            'path': self.request.path,
        }
        print("\n" + "="*50)
        print("ERROR IN MEMBERSHIP VIEW:")
        for k, v in error_details.items():
            print(f"{k.upper()}:\n{v}")
        print("="*50 + "\n")
        
        # Return a proper error response
        from rest_framework.response import Response
        from rest_framework import status
        return Response(
            {"detail": "An error occurred while processing your request."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

class MembershipDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Membership.objects.all()
    serializer_class = MembershipSerializer
    permission_classes = [permissions.IsAuthenticated, IsApplicant, IsOwnerOrReadOnly]

class ExperienceListCreateView(generics.ListCreateAPIView):
    serializer_class = ExperienceSerializer
    permission_classes = [permissions.IsAuthenticated, IsApplicant]
    def get_queryset(self):
        profile = FacultyProfile.objects.filter(user=self.request.user).first()
        return profile.experiences.all().order_by('-created_at') if profile else Experience.objects.none()
    def perform_create(self, serializer):
        profile, _ = FacultyProfile.objects.get_or_create(user=self.request.user)
        serializer.save(profile=profile)

class ExperienceDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Experience.objects.all()
    serializer_class = ExperienceSerializer
    permission_classes = [permissions.IsAuthenticated, IsApplicant, IsOwnerOrReadOnly]

class SkillListCreateView(generics.ListCreateAPIView):
    serializer_class = SkillSerializer
    permission_classes = [permissions.IsAuthenticated, IsApplicant]
    def get_queryset(self):
        profile = FacultyProfile.objects.filter(user=self.request.user).first()
        return profile.skills.all() if profile else Skill.objects.none()
    def perform_create(self, serializer):
        profile, _ = FacultyProfile.objects.get_or_create(user=self.request.user)
        serializer.save(profile=profile)

class SkillDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    permission_classes = [permissions.IsAuthenticated, IsApplicant, IsOwnerOrReadOnly]

class PresentationListCreateView(generics.ListCreateAPIView):
    serializer_class = PresentationSerializer
    permission_classes = [permissions.IsAuthenticated, IsApplicant]
    def get_queryset(self):
        profile = FacultyProfile.objects.filter(user=self.request.user).first()
        return profile.presentations.all() if profile else Presentation.objects.none()
    def perform_create(self, serializer):
        profile, _ = FacultyProfile.objects.get_or_create(user=self.request.user)
        serializer.save(profile=profile)

class PresentationDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Presentation.objects.all()
    serializer_class = PresentationSerializer
    permission_classes = [permissions.IsAuthenticated, IsApplicant, IsOwnerOrReadOnly]

class DocumentListCreateView(generics.ListCreateAPIView):
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated, IsApplicant]
    def get_queryset(self):
        profile = FacultyProfile.objects.filter(user=self.request.user).first()
        return profile.documents.all().order_by('-uploaded_at') if profile else Document.objects.none()
    def perform_create(self, serializer):
        profile, _ = FacultyProfile.objects.get_or_create(user=self.request.user)
        serializer.save(profile=profile)

class DocumentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated, IsApplicant, IsOwnerOrReadOnly]

