from django.contrib import admin
from .models import TMDBItem, WatchlistItem


@admin.register(TMDBItem)
class TMDBItemAdmin(admin.ModelAdmin):
    list_display = ("title", "media_type", "tmdb_id", "updated_at")
    search_fields = ("title", "tmdb_id")


@admin.register(WatchlistItem)
class WatchlistItemAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "get_title", "get_media_type", "added_at")
    search_fields = ("user__username", "tmdb_item__title")
    list_filter = ("added_at",)

    def get_title(self, obj):
        return obj.tmdb_item.title
    get_title.short_description = "Title"

    def get_media_type(self, obj):
        return obj.tmdb_item.media_type
    get_media_type.short_description = "Type"
