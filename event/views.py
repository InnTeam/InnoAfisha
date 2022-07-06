from rest_framework import viewsets

from event.models import EventModel
from event.permissions import IsAdminOrReadOnly
from event.serializers import EventSerializer


class EventViewSet(viewsets.ModelViewSet):
    queryset = EventModel.objects.all()
    serializer_class = EventSerializer
    permission_classes = (IsAdminOrReadOnly, )
