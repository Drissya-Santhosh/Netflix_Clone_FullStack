from rest_framework import serializers
from django.contrib.auth.models import User
from .models import TMDBItem, WatchlistItem


# -------------------------------
#  TMDB ITEM SERIALIZER
# -------------------------------
class TMDBItemSerializer(serializers.ModelSerializer):
    poster_url = serializers.SerializerMethodField()

    class Meta:
        model = TMDBItem
        fields = [
            "id",
            "tmdb_id",
            "media_type",
            "title",
            "overview",
            "poster_path",
            "poster_url",
            "backdrop_path",
            "updated_at",
        ]

    def get_poster_url(self, obj):
        return obj.get_poster_url()


# -------------------------------
#  WATCHLIST ITEM SERIALIZER
# -------------------------------
class WatchlistItemSerializer(serializers.ModelSerializer):
    tmdb_item = TMDBItemSerializer(read_only=True)

    class Meta:
        model = WatchlistItem
        fields = ["id", "user", "tmdb_item", "added_at"]
        read_only_fields = ["user", "added_at"]

    def create(self, validated_data):
        """Automatically assign the logged-in user"""
        request = self.context.get("request")
        validated_data["user"] = request.user
        return super().create(validated_data)


# -------------------------------
#  USER REGISTRATION SERIALIZER
# -------------------------------
class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["username", "email", "password"]

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
        )
        return user


# -------------------------------
#  USER PROFILE SERIALIZER
# -------------------------------
class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name"]

from .models import ContinueWatching

class ContinueWatchingSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContinueWatching
        fields = ["id", "movie_id", "title", "poster_path", "progress", "updated_at"]

