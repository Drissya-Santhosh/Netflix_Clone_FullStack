from django.db import models
from django.contrib.auth.models import User

class TMDBItem(models.Model):
    tmdb_id = models.IntegerField(unique=True)
    media_type = models.CharField(max_length=10)  # 'movie' or 'tv'
    title = models.CharField(max_length=300)
    overview = models.TextField(blank=True, null=True)
    poster_path = models.CharField(max_length=500, blank=True, null=True)
    backdrop_path = models.CharField(max_length=500, blank=True, null=True)
    raw_json = models.JSONField()
    updated_at = models.DateTimeField(auto_now=True)

    def get_poster_url(self, size="w342"):
        if not self.poster_path:
            return ""
        return f"https://image.tmdb.org/t/p/{size}{self.poster_path}"

    def __str__(self):
        return f"{self.title} ({self.media_type})"


class WatchlistItem(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="watchlist_items")
    tmdb_item = models.ForeignKey(TMDBItem, on_delete=models.CASCADE, related_name="watchlist_entries")
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "tmdb_item")
        ordering = ["-added_at"]

    def __str__(self):
        return f"{self.tmdb_item.title} ({self.user.username})"


class ContinueWatching(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="continue_watching")
    movie_id = models.CharField(max_length=100)
    title = models.CharField(max_length=255)
    poster_path = models.URLField(blank=True, null=True)
    progress = models.FloatField(default=0.0)  # percentage (0.0 - 100.0)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("user", "movie_id")
        ordering = ["-updated_at"]

    def __str__(self):
        return f"{self.title} ({self.progress:.1f}%)"
