# users/serializers.py
import re
import json
from rest_framework import serializers
from .models import (
    CustomUser,
    FacultyProfile,
    RecruiterProfile,
    College,
    Degree,
    Department,
    Education,
    Transcript,
    Course,
    Certificate,
    Membership,
    Experience,
    Skill,
    Presentation,
    Document,
)


# -----------------------
# Helper: normalize camelCase -> snake_case for incoming data
# -----------------------
def camel_to_snake(name):
    s1 = re.sub("(.)([A-Z][a-z]+)", r"\1_\2", name)
    return re.sub("([a-z0-9])([A-Z])", r"\1_\2", s1).lower()


def validate_file_size(file, max_mb=10):
    if not file:
        return
    limit = max_mb * 1024 * 1024
    if file.size > limit:
        raise serializers.ValidationError(f"File size must be <= {max_mb} MB")


class CamelInputModelSerializer(serializers.ModelSerializer):
    """
    ModelSerializer that accepts camelCase keys from frontend by converting
    them to snake_case before validation.
    """

    def to_internal_value(self, data):
        if isinstance(data, dict):
            new = {}
            for key, val in data.items():
                new_key = camel_to_snake(key) if any(c.isupper() for c in key) else key
                new[new_key] = val
            return super().to_internal_value(new)
        return super().to_internal_value(data)


# -----------------------
# Existing user / registration serializers
# -----------------------
class UserSerializer(serializers.ModelSerializer):
    first_name = serializers.SerializerMethodField()
    last_name = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "is_faculty",
            "is_recruiter",
        ]
        read_only_fields = ["id", "is_faculty", "is_recruiter"]

    def get_first_name(self, obj):
        if hasattr(obj, "facultyprofile"):
            return obj.facultyprofile.first_name
        elif hasattr(obj, "recruiterprofile"):
            return obj.recruiterprofile.first_name
        return None

    def get_last_name(self, obj):
        if hasattr(obj, "facultyprofile"):
            return obj.facultyprofile.last_name
        elif hasattr(obj, "recruiterprofile"):
            return obj.recruiterprofile.last_name
        return None


class FacultyRegistrationSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    work_preference = serializers.CharField()
    resume = serializers.FileField(required=True)
    transcripts = serializers.FileField(required=True)
    password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = [
            "email",
            "password",
            "first_name",
            "last_name",
            "work_preference",
            "resume",
            "transcripts",
        ]

    def create(self, validated_data):
        profile_data = {
            "first_name": validated_data.pop("first_name"),
            "last_name": validated_data.pop("last_name"),
            "work_preference": validated_data.pop("work_preference"),
            "resume": validated_data.pop("resume"),
            "transcripts": validated_data.pop("transcripts"),
        }

        user = CustomUser.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
            is_faculty=True,
        )

        FacultyProfile.objects.create(user=user, **profile_data)
        return user




class RecruiterRegistrationSerializer(CamelInputModelSerializer):
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    college = serializers.CharField()
    password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ["email", "password", "first_name", "last_name", "college"]

    def create(self, validated_data):
        profile_data = {
            "first_name": validated_data.pop("first_name"),
            "last_name": validated_data.pop("last_name"),
            "college": validated_data.pop("college"),
        }

        user = CustomUser.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
            is_recruiter=True,
        )

        RecruiterProfile.objects.create(user=user, **profile_data)
        return user


# -----------------------
# Basic profile serializers
# -----------------------
class UserBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ("id", "email", "is_faculty", "is_recruiter", "last_login")
        read_only_fields = ("id", "email", "is_faculty", "is_recruiter", "last_login")


class FacultyProfileSerializer(CamelInputModelSerializer):
    user = UserBasicSerializer(read_only=True)
    resume = serializers.FileField(required=False, allow_null=True)
    transcripts = serializers.FileField(required=False, allow_null=True)
    profile_photo = serializers.FileField(required=False, allow_null=True)
    # JSONField works for list storage; incoming camelCase handled by CamelInputModelSerializer
    work_preference = serializers.ListField(
        child=serializers.CharField(), required=False
    )

    class Meta:
        model = FacultyProfile
        fields = (
            "id",
            "user",
            "title",
            "first_name",
            "last_name",
            "phone",
            "dob",
            "gender",
            "state",
            "city",
            "linkedin",
            "work_preference",
            "profile_photo",
            "resume",
            "transcripts",
        )
        read_only_fields = ("id", "user")

    def _coerce_work_pref(self, val):
        if val is None:
            return []
        if isinstance(val, list):
            return val
        if isinstance(val, str):
            try:
                parsed = json.loads(val)
                if isinstance(parsed, list):
                    return parsed
            except Exception:
                pass
            return [x.strip() for x in val.split(",") if x.strip()]
        return []

    def update(self, instance, validated_data):
        # handle file fields & work_preference safely
        wp = validated_data.pop("work_preference", None)
        if wp is not None:
            wp = self._coerce_work_pref(wp)
            instance.work_preference = wp

        # for other fields (including file fields), set directly
        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        instance.save()
        return instance


class RecruiterProfileSerializer(serializers.ModelSerializer):
    user = UserBasicSerializer(read_only=True)

    class Meta:
        model = RecruiterProfile
        fields = ("id", "user", "first_name", "last_name", "college")
        read_only_fields = ("id", "user")


# -----------------------
# Lookup serializers
# -----------------------
class CollegeSerializer(serializers.ModelSerializer):
    class Meta:
        model = College
        fields = ("id", "name")


class DegreeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Degree
        fields = ("id", "name")


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ("id", "name")


# -----------------------
# Education Serializer
# -----------------------
class EducationSerializer(CamelInputModelSerializer):
    class Meta:
        model = Education
        read_only_fields = ("id", "created_at")
        fields = (
            "id",
            "degree",
            "specialization",
            "university",
            "program",
            "year",
            "is_research",
            "dissertation_title",
            "abstract",
            "created_at",
        )


# -----------------------
# Transcript & Course serializers
# -----------------------
# users/serializers.py — replace CourseSerializer and TranscriptSerializer sections


class CourseSerializer(CamelInputModelSerializer):
    credit_hours = serializers.FloatField(write_only=True, required=False)
    creditHours = serializers.FloatField(write_only=True, required=False)
    department = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(), allow_null=True, required=False
    )
    department_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Course
        read_only_fields = ("id", "created_at")
        fields = (
            "id",
            "code",
            "name",
            "credits",
            "grade",
            "department",
            "department_name",
            "created_at",
            "credit_hours",
            "creditHours",
        )

    def get_department_name(self, obj):
        return obj.department.name if obj.department else None

    def to_internal_value(self, data):
        # Create a mutable copy of the data
        if not isinstance(data, dict):
            data = {}

        # Make a copy to avoid modifying the original
        data = dict(data)

        # Normalize credits field
        if "creditHours" in data and "credits" not in data:
            data["credits"] = data.pop("creditHours")
        elif "credit_hours" in data and "credits" not in data:
            data["credits"] = data.pop("credit_hours")

        # Handle department if it's sent as a dictionary with id
        if (
            "department" in data
            and isinstance(data["department"], dict)
            and "id" in data["department"]
        ):
            data["department"] = data["department"]["id"]
        # If accidentally sent as a model instance, coerce to pk
        if "department" in data and isinstance(data["department"], Department):
            data["department"] = data["department"].pk
        # If department is a name string, resolve to id if possible
        if "department" in data and isinstance(data["department"], str) and data["department"] and not data["department"].isdigit():
            try:
                dept = Department.objects.filter(name=data["department"]).first()
                data["department"] = dept.pk if dept else None
            except Exception:
                data["department"] = None
        # Coerce empty string department to None
        if "department" in data and (data["department"] == "" or data["department"] is None):
            data["department"] = None

        return super().to_internal_value(data)

    def validate(self, attrs):
        # Ensure credits is a valid number if provided
        if "credits" in attrs and attrs["credits"] is not None:
            try:
                attrs["credits"] = float(attrs["credits"])
            except (ValueError, TypeError):
                raise serializers.ValidationError({"credits": "Must be a valid number"})
        return attrs

    def validate_file(self, uploaded):
        validate_file_size(uploaded, max_mb=5)
        return uploaded


class TranscriptSerializer(CamelInputModelSerializer):
    courses = CourseSerializer(many=True, required=False)
    department = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(), allow_null=True, required=False
    )
    department_name = serializers.SerializerMethodField(read_only=True)
    file = serializers.FileField(required=False, allow_null=True)
    degree_level = serializers.ChoiceField(
        choices=Transcript.DEGREE_LEVELS,
        required=True,
        error_messages={
            "required": "Please select a degree level (Master's or Doctorate)",
            "invalid_choice": "Degree level must be either Master's or Doctorate",
        },
    )

    class Meta:
        model = Transcript
        read_only_fields = ("id", "created_at")
        fields = (
            "id",
            "degree_level",
            "degree",
            "college",
            "major",
            "department",
            "department_name",
            "year_completed",
            "file",
            "courses",
            "created_at",
        )

    def get_department_name(self, obj):
        return obj.department.name if obj.department else None

    def validate_file(self, uploaded):
        if uploaded:
            validate_file_size(uploaded, max_mb=5)
        return uploaded

    def to_internal_value(self, data):
        # Normalize/alias degree_level values from UI
        if isinstance(data, dict) and "degree_level" in data:
            # ensure we don't mutate original
            data = data.copy()
            val = str(data.get("degree_level", "")).strip()
            mapping = {
                "Masters": "Master's",
                "Master's Degree": "Master's",
                "Doctoral": "Doctorate",
                "Doctoral Degree": "Doctorate",
                "PhD": "Doctorate",
                "Ph.D": "Doctorate",
                "Ph.D.": "Doctorate",
            }
            data["degree_level"] = mapping.get(val, val)

        # Handle department if it's sent as a dictionary with id
        if (
            isinstance(data, dict)
            and "department" in data
            and isinstance(data["department"], dict)
            and "id" in data["department"]
        ):
            data = data.copy()
            data["department"] = data["department"]["id"]
        # If accidentally sent as a model instance, coerce to pk
        if isinstance(data, dict) and "department" in data and isinstance(data["department"], Department):
            data["department"] = data["department"].pk
        # If department is a name string, resolve to id if possible
        if isinstance(data, dict) and "department" in data and isinstance(data["department"], str) and data["department"] and not data["department"].isdigit():
            try:
                dept = Department.objects.filter(name=data["department"]).first()
                data["department"] = dept.pk if dept else None
            except Exception:
                data["department"] = None
        # Normalize year_completed if present
        try:
            if isinstance(data, dict) and "year_completed" in data:
                yc = data.get("year_completed")
                if yc in ("", None):
                    data["year_completed"] = None
                else:
                    data["year_completed"] = int(yc)
        except Exception:
            pass
        return super().to_internal_value(data)

    def create(self, validated_data):
        courses_data = validated_data.pop("courses", [])

        # The profile should be passed in the context from the view
        profile = self.context.get("profile")
        if not profile and hasattr(self.context.get("request"), "user"):
            profile = getattr(self.context["request"].user, "facultyprofile", None)

        if not profile:
            raise serializers.ValidationError("Profile is required")

        # Add the profile to the validated data
        validated_data["profile"] = profile

        # Create the transcript
        transcript = super().create(validated_data)

        # Create associated courses
        for course_data in courses_data:
            # Create the course using the CourseSerializer to handle department and credits
            course_serializer = CourseSerializer(data=course_data, context=self.context)
            course_serializer.is_valid(raise_exception=True)
            # Pass the parent transcript explicitly (field not declared on serializer fields)
            course_serializer.save(transcript=transcript)

        return transcript

    def update(self, instance, validated_data, **kwargs):
        courses_data = validated_data.pop("courses", None)

        # Update transcript fields
        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        instance.save()

        # Update courses if provided
        if courses_data is not None:
            # Delete existing courses
            instance.courses.all().delete()

            # Create new courses
            for course_data in courses_data:
                # Create the course using the CourseSerializer to handle department and credits
                course_serializer = CourseSerializer(
                    data=course_data, context=self.context
                )
                course_serializer.is_valid(raise_exception=True)
                # Pass the parent transcript explicitly (field not declared on serializer fields)
                course_serializer.save(transcript=instance)

        return instance


class CertificateSerializer(CamelInputModelSerializer):
    file = serializers.FileField(required=False, allow_null=True)

    class Meta:
        model = Certificate
        read_only_fields = ("id", "created_at")
        fields = (
            "id",
            "name",
            "number",
            "provider",
            "issue_date",
            "expiry_date",
            "file",
            "created_at",
        )

    def validate_file(self, uploaded):
        if uploaded:
            validate_file_size(uploaded, max_mb=5)
        return uploaded


class MembershipSerializer(CamelInputModelSerializer):
    class Meta:
        model = Membership
        read_only_fields = ("id", "created_at")
        fields = (
            "id",
            "organization",
            "membership_id",
            "start_date",
            "end_date",
            "is_current",
            "created_at",
        )


class ExperienceSerializer(CamelInputModelSerializer):
    class Meta:
        model = Experience
        read_only_fields = ("id", "created_at")
        fields = (
            "id",
            "exp_type",
            "institution_or_company",
            "position",
            "responsibilities",
            "start_date",
            "end_date",
            "is_current",
            "created_at",
        )


class SkillSerializer(CamelInputModelSerializer):
    class Meta:
        model = Skill
        read_only_fields = ("id",)
        fields = ("id", "skill", "proficiency")


class PresentationSerializer(CamelInputModelSerializer):
    class Meta:
        model = Presentation
        read_only_fields = ("id",)
        fields = ("id", "title", "date", "venue")


class DocumentSerializer(CamelInputModelSerializer):
    file = serializers.FileField(required=False, allow_null=True)

    class Meta:
        model = Document
        read_only_fields = ("id", "uploaded_at")
        fields = ("id", "name", "doc_type", "file", "uploaded_at", "size")
