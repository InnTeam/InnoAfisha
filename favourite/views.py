from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from favourite.models import FavouriteModel
from favourite.serializers import FavouriteSerializer


class FavouriteViewSet(viewsets.ModelViewSet):
    queryset = FavouriteModel.objects.all()
    serializer_class = FavouriteSerializer
    permission_classes = (IsAuthenticated,)
