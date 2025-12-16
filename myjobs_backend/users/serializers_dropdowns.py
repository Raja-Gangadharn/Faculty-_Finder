from rest_framework import serializers
from .models import Degree, College, Department

class DegreeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Degree
        fields = ['id', 'name']
        read_only_fields = ['id']

class CollegeSerializer(serializers.ModelSerializer):
    class Meta:
        model = College
        fields = ['id', 'name']
        read_only_fields = ['id']

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['id', 'name']
        read_only_fields = ['id']
