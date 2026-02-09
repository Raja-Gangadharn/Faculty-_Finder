from django.apps import AppConfig


class UsersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'users'


# users/apps.py
from django.apps import AppConfig
import os

class UsersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'users'

    def ready(self):
        # 🔐 Only run on Render (not local)
        if os.getenv("RENDER") != "true":
            return

        from django.contrib.auth import get_user_model
        User = get_user_model()

        email = "admin@facultyfinder.com"
        password = "Admin@123"

        try:
            if not User.objects.filter(email=email).exists():
                User.objects.create_superuser(
                    email=email,
                    password=password
                )
                print("✅ Render admin created")
            else:
                print("ℹ️ Render admin already exists")
        except Exception as e:
            print("❌ Render admin error:", e)
