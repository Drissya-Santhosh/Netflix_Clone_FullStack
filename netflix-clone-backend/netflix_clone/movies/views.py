from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404

from .models import TMDBItem, WatchlistItem
from .serializers import TMDBItemSerializer, WatchlistItemSerializer
from .tmdb_client import get_popular, get_trending, get_details, search


class TMDBViewSet(viewsets.ViewSet):
    """
    Read-only viewset for TMDB data fetched live via API.
    """

    permission_classes = [AllowAny]

    @action(detail=False, methods=["get"])
    def trending(self, request):
        data = get_trending("all", "week").get("results", [])
        return Response(data)

    @action(detail=False, methods=["get"])
    def popular(self, request):
        media_type = request.query_params.get("type", "movie")
        page = request.query_params.get("page", 1)
        data = get_popular(media_type, page).get("results", [])
        return Response(data)

    @action(detail=False, methods=["get"])
    def search(self, request):
        query = request.query_params.get("q", "")
        if not query:
            return Response({"detail": "Query parameter 'q' required."}, status=400)
        data = search("multi", query).get("results", [])
        return Response(data)

    @action(detail=True, methods=["get"], url_path=r"detail/(?P<media_type>[^/.]+)")
    def detail(self, request, pk=None, media_type=None):
        """
        Example: /api/tmdb/1234/detail/movie/
        """
        data = get_details(media_type, pk)
        return Response(data)


class WatchlistViewSet(viewsets.ModelViewSet):
    """
    CRUD endpoints for user watchlist.
    """

    serializer_class = WatchlistItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return WatchlistItem.objects.filter(user=self.request.user)

    @action(detail=False, methods=["post"])
    def add(self, request):
        tmdb_id = request.data.get("tmdb_id")
        media_type = request.data.get("media_type", "movie")
        if not tmdb_id:
            return Response({"error": "tmdb_id required"}, status=400)

        # fetch or create local TMDB item
        details = get_details(media_type, tmdb_id)
        obj, _ = TMDBItem.objects.update_or_create(
            tmdb_id=tmdb_id,
            media_type=media_type,
            defaults={
                "title": details.get("title") or details.get("name"),
                "overview": details.get("overview"),
                "poster_path": details.get("poster_path"),
                "backdrop_path": details.get("backdrop_path"),
                "raw_json": details,
            },
        )

        WatchlistItem.objects.get_or_create(user=request.user, tmdb_item=obj)
        return Response({"message": "Added to watchlist"}, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["post"])
    def remove(self, request):
        tmdb_id = request.data.get("tmdb_id")
        if not tmdb_id:
            return Response({"error": "tmdb_id required"}, status=400)
        try:
            item = TMDBItem.objects.get(tmdb_id=tmdb_id)
            WatchlistItem.objects.filter(user=request.user, tmdb_item=item).delete()
            return Response({"message": "Removed from watchlist"})
        except TMDBItem.DoesNotExist:
            return Response({"error": "Item not found"}, status=404)


from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from .serializers import UserRegisterSerializer

class RegisterView(APIView):
    permission_classes = [AllowAny]
    """
    User signup endpoint. Automatically returns JWT tokens after registration.
    """

    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()

            # Generate JWT tokens immediately after signup
            refresh = RefreshToken.for_user(user)
            tokens = {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            }

            return Response(
                {
                    "message": "Registration successful",
                    "user": {
                        "username": user.username,
                        "email": user.email,
                    },
                    "tokens": tokens,
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserProfileSerializer

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Return the logged-in user's profile"""
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        """Update the logged-in user's profile"""
        serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

from .models import ContinueWatching
from .serializers import ContinueWatchingSerializer
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

class ContinueWatchingViewSet(viewsets.ModelViewSet):
    serializer_class = ContinueWatchingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ContinueWatching.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        serializer.save(user=self.request.user)
