# users/migrations/0004_create_course_model.py
from django.db import migrations, models
import django.db.models.deletion

class Migration(migrations.Migration):

    dependencies = [
        ('users', '0003_alter_transcript_department'),
    ]

    operations = [
        migrations.CreateModel(
            name='Course',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('code', models.CharField(blank=True, max_length=50)),
                ('name', models.CharField(max_length=255)),
                ('credits', models.FloatField(blank=True, null=True)),
                ('grade', models.CharField(blank=True, max_length=50)),
                ('created_at', models.DateTimeField(blank=True, null=True)),
                ('department', models.ForeignKey(
                    blank=True,
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='courses',
                    to='users.department'
                )),
                ('transcript', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='courses',
                    to='users.transcript'
                )),
            ],
            options={
                'ordering': ['-id'],
            },
        ),
    ]
