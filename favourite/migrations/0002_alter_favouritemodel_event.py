# Generated by Django 4.0.5 on 2022-07-11 08:31

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('event', '0003_alter_eventmodel_picture'),
        ('favourite', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='favouritemodel',
            name='event',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='event.eventmodel'),
        ),
    ]
