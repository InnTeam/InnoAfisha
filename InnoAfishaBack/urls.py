from django.contrib import admin
from django.urls import path, include, re_path
from rest_framework import routers

from event.views import EventViewSet
from favourite.views import FavouriteViewSet

router = routers.DefaultRouter(trailing_slash=False)
router.register('events', EventViewSet, basename='events')
router.register('favourites', FavouriteViewSet, basename='favourites')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include(router.urls)),
    path('api/v1/auth', include('djoser.urls')),
    re_path(r'^auth/', include('djoser.urls.authtoken')),
    path('api/v1/drf-auth/', include('rest_framework.urls'))
]
