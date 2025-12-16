from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Degree, College, Department
from .serializers_dropdowns import DegreeSerializer, CollegeSerializer, DepartmentSerializer

class DegreeListView(generics.ListAPIView):
    """
    API endpoint that allows degrees to be viewed.
    """
    queryset = Degree.objects.all().order_by('name')
    serializer_class = DegreeSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

class CollegeListView(generics.ListAPIView):
    """
    API endpoint that allows colleges to be viewed.
    """
    queryset = College.objects.all().order_by('name')
    serializer_class = CollegeSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

class DepartmentListView(generics.ListAPIView):
    """
    API endpoint that allows departments to be viewed.
    """
    queryset = Department.objects.all().order_by('name')
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None
