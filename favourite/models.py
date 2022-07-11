from django.contrib.auth.models import User
from django.db import models

from event.models import EventModel


class FavouriteModel(models.Model):
    user = models.ForeignKey(User, verbose_name='User', on_delete=models.CASCADE)
    event = models.ForeignKey(EventModel, on_delete=models.CASCADE, null=False, blank=False)

    class Meta:
        db_table = "Favourites"
