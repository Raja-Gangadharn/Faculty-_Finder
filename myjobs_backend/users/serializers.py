from rest_framework import serializers
from .models import CustomUser, FacultyProfile, RecruiterProfile

class FacultyRegistrationSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    work_preference = serializers.CharField()
    resume = serializers.FileField()
    transcripts = serializers.FileField()
    password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ['email', 'password', 'first_name', 'last_name', 'work_preference', 'resume', 'transcripts']

    def create(self, validated_data):
        profile_data = {
            'first_name': validated_data.pop('first_name'),
            'last_name': validated_data.pop('last_name'),
            'work_preference': validated_data.pop('work_preference'),
            'resume': validated_data.pop('resume'),
            'transcripts': validated_data.pop('transcripts'),
        }

        user = CustomUser.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            is_faculty=True
        )

        FacultyProfile.objects.create(user=user, **profile_data)
        return user

class RecruiterRegistrationSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    college = serializers.CharField()
    password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ['email', 'password', 'first_name', 'last_name', 'college']

    def create(self, validated_data):
        profile_data = {
            'first_name': validated_data.pop('first_name'),
            'last_name': validated_data.pop('last_name'),
            'college': validated_data.pop('college'),
        }

        user = CustomUser.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            is_recruiter=True
        )

        RecruiterProfile.objects.create(user=user, **profile_data)
        return user
