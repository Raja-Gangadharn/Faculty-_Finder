from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

class Command(BaseCommand):
    help = "Create superuser for Render (one-time)"

    def handle(self, *args, **kwargs):
        User = get_user_model()

        email = "admin@facultyfinder.com"
        password = "Admin@123"

        if User.objects.filter(email=email).exists():
            self.stdout.write(self.style.WARNING("Admin already exists"))
        else:
            User.objects.create_superuser(
                email=email,
                password=password
            )
            self.stdout.write(self.style.SUCCESS("Admin user created successfully"))
