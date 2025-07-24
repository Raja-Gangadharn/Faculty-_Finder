from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status
from django.contrib.auth import authenticate, get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import FacultyRegistrationSerializer, RecruiterRegistrationSerializer

User = get_user_model()

class FacultyRegistrationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = FacultyRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                "message": "Faculty registered successfully",
                "user_id": user.id,
                "email": user.email,
                "is_faculty": user.is_faculty,
            }, status=status.HTTP_201_CREATED)
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
