from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
import threading
import logging

logger = logging.getLogger(__name__)

def send_welcome_email(user_email, first_name):
    """
    Send a welcome email to the newly registered faculty member
    """
    def send_email():
        try:
            subject = 'Welcome to Faculty Portal - Registration Successful'
            
            # Render the email template
            context = {
                'first_name': first_name,
                'support_email': settings.DEFAULT_FROM_EMAIL
            }
            
            html_content = render_to_string('emails/faculty_welcome_email.html', context)
            text_content = f"""
            Welcome {first_name},
            
            Thank you for registering with the Faculty Portal. Your account has been successfully created.
            
            Best regards,
            The Faculty Portal Team
            {settings.DEFAULT_FROM_EMAIL}
            """
            
            msg = EmailMultiAlternatives(
                subject=subject,
                body=text_content,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[user_email],
                reply_to=[settings.DEFAULT_FROM_EMAIL]
            )
            msg.attach_alternative(html_content, "text/html")
            msg.send()
            logger.info(f"Welcome email sent successfully to {user_email}")
        except Exception as e:
            logger.error(f"Failed to send welcome email to {user_email}: {str(e)}")
    
    # Send email in background thread to avoid blocking registration
    thread = threading.Thread(target=send_email, daemon=True)
    thread.start()

def send_admin_notification(user_email, first_name, last_name):
    """
    Send a notification to the admin about the new faculty registration
    """
    def send_email():
        try:
            subject = f'New Faculty Registration: {first_name} {last_name}'
            
            context = {
                'first_name': first_name,
                'last_name': last_name,
                'email': user_email
            }
            
            html_content = render_to_string('emails/admin_registration_notification.html', context)
            text_content = f"""
            A new faculty member has registered:
            
            Name: {first_name} {last_name}
            Email: {user_email}
            
            This is an automated notification. No action is required.
            """
            
            msg = EmailMultiAlternatives(
                subject=subject,
                body=text_content,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[settings.ADMIN_EMAIL],
                reply_to=[settings.DEFAULT_FROM_EMAIL]
            )
            msg.attach_alternative(html_content, "text/html")
            msg.send()
            logger.info(f"Admin notification sent for new registration: {user_email}")
        except Exception as e:
            logger.error(f"Failed to send admin notification for {user_email}: {str(e)}")
    
    # Send email in background thread to avoid blocking registration
    thread = threading.Thread(target=send_email, daemon=True)
    thread.start()
