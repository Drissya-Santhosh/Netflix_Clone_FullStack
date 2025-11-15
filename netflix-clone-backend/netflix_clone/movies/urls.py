from rest_framework.routers import DefaultRouter
from .views import TMDBViewSet, WatchlistViewSet, ContinueWatchingViewSet

router = DefaultRouter()
router.register(r"tmdb", TMDBViewSet, basename="tmdb")
router.register(r"watchlist", WatchlistViewSet, basename="watchlist")

urlpatterns = router.urls

router.register(r'continue-watching', ContinueWatchingViewSet, basename='continue-watching')
