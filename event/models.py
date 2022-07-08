from django.db import models


class EventModel(models.Model):
    id = models.AutoField(primary_key=True)
    event_name = models.CharField(max_length=100, null=False, blank=False)
    description = models.CharField(max_length=500, null=False, blank=False)
    type = models.CharField(max_length=100, null=False, blank=False)
    price = models.FloatField(null=False, blank=False)
    picture = models.CharField(max_length=5000, null=True, blank=True, default='')
    date = models.DateField(null=False, blank=False)
    time = models.TimeField(null=False, blank=False)
    rating = models.IntegerField(null=False, blank=False)
    location = models.CharField(max_length=500, null=False, blank=False)
    contacts = models.CharField(max_length=500, null=False, blank=False)
    link = models.CharField(max_length=500, null=False, blank=False)

    class Meta:
        db_table = "Events"
