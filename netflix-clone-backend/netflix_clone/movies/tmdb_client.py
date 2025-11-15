# movies/tmdb_client.py
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from django.conf import settings
from django.core.cache import cache
from urllib.parse import urljoin
import logging

logger = logging.getLogger(__name__)

BASE_URL = "https://api.themoviedb.org/3/"

# ---- Create a session with retry strategy ----
session = requests.Session()
retries = Retry(
    total=5,                     # Retry up to 5 times
    backoff_factor=0.3,          # Sleep 0.3s, then 0.6s, 1.2s, etc.
    status_forcelist=[429, 500, 502, 503, 504],  # Retry on these codes
    allowed_methods=["GET"],
    raise_on_status=False
)
adapter = HTTPAdapter(max_retries=retries)
session.mount("https://", adapter)
session.mount("http://", adapter)


def _get(path, params=None, cache_key=None, cache_time=60 * 15):
    """
    Generic helper to fetch data from TMDB with caching and retries.
    """
    if params is None:
        params = {}
    params["api_key"] = settings.TMDB_API_KEY

    full_key = f"tmdb:{cache_key or path}:{params.get('query', '')}"
    data = cache.get(full_key)
    if data:
        return data

    url = urljoin(BASE_URL, path)

    try:
        resp = session.get(url, params=params, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        cache.set(full_key, data, cache_time)
        return data

    except requests.exceptions.RequestException as e:
        logger.warning(f"TMDB request failed for {url}: {e}")
        # Return an empty dict to prevent crashes
        return {}


def get_popular(media_type="movie", page=1):
    return _get(f"{media_type}/popular", {"page": page}, cache_key=f"{media_type}-popular-{page}")


def get_trending(media_type="all", time_window="week"):
    return _get(f"trending/{media_type}/{time_window}", cache_key=f"trending-{media_type}-{time_window}")


def get_details(media_type, tmdb_id):
    return _get(
        f"{media_type}/{tmdb_id}",
        {"append_to_response": "videos,credits,images"},
        cache_key=f"{media_type}-{tmdb_id}",
    )


def search(media_type="multi", query="", page=1):
    return _get(
        "search/" + media_type,
        {"query": query, "page": page},
        cache_key=f"search-{media_type}-{query}-{page}",
    )
