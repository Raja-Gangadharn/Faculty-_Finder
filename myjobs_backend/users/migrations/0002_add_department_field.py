from django.db import migrations, models
import django.db.models.deletion


def add_department_field(apps, schema_editor):
    Transcript = apps.get_model('users', 'Transcript')
    Department = apps.get_model('users', 'Department')
    
    # Get or create a default department
    default_dept, _ = Department.objects.get_or_create(name='Default Department')
    
    # Add the department field to all existing transcripts
    for transcript in Transcript.objects.all():
        transcript.department = default_dept
        transcript.save()


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='transcript',
            name='department',
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='transcripts',
                to='users.department',
            ),
            preserve_default=False,
        ),
        migrations.RunPython(add_department_field, migrations.RunPython.noop),
    ]
