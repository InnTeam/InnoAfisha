from rest_framework import serializers

from favourite.models import FavouriteModel


class FavouriteSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default=serializers.CreateOnlyDefault(serializers.CurrentUserDefault()))

    class Meta:
        model = FavouriteModel
        fields = "__all__"
