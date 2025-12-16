# users/permissions.py
from rest_framework import permissions

class IsRecruiter(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_recruiter)

class IsApplicant(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_faculty)

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Object-level permission to only allow owners of an object to edit it.
    Supports objects with .user, .owner, .applicant, .posted_by or .profile.user
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True

        # check common attributes
        if hasattr(obj, 'user'):
            return obj.user == request.user
        if hasattr(obj, 'owner'):
            return obj.owner == request.user
        if hasattr(obj, 'applicant'):
            return obj.applicant == request.user
        if hasattr(obj, 'posted_by'):
            return obj.posted_by == request.user
        # support objects that are child of profile (e.g., Education.profile.user)
        if hasattr(obj, 'profile') and hasattr(obj.profile, 'user'):
            return obj.profile.user == request.user

        return False
