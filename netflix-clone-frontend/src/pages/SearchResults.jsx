import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const API_KEY = "7c71e9734e3f6b9753d6d5536489316b";

export default function SearchResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, movie, tv
  const [watchLater, setWatchLater] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get("q");

  useEffect(() => {
    if (query) {
      fetchSearchResults();
    }
  }, [query, filter]);

  const fetchSearchResults = async () => {
    if (!query) return;
    
    setLoading(true);
    try {
      let url = `https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=1&include_adult=false`;
      
      if (filter === "movie") {
        url = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=1&include_adult=false`;
      } else if (filter === "tv") {
        url = `https://api.themoviedb.org/3/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=1&include_adult=false`;
      }

      const response = await fetch(url);
      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMovieClick = (media) => {
    navigate(`/movie/${media.id}`);
  };

  const toggleWatchLater = (itemId, event) => {
    event.stopPropagation();
    setWatchLater((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const filteredResults = results.filter(item => {
    if (filter === "all") return true;
    if (filter === "movie") return item.media_type === "movie" || !item.media_type;
    if (filter === "tv") return item.media_type === "tv";
    return true;
  });

  if (!query) {
    return (
      <div className="bg-black min-h-screen text-white">
        <Navbar />
        <div className="pt-20 p-8 text-center">
          <h1 className="text-2xl">Please enter a search query</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar />
      
      <div className="pt-20 p-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">
            Search Results for "{query}"
          </h1>
          
          {/* Filter Buttons */}
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg transition ${
                filter === "all" 
                  ? "bg-red-600 text-white" 
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("movie")}
              className={`px-4 py-2 rounded-lg transition ${
                filter === "movie" 
                  ? "bg-red-600 text-white" 
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              Movies
            </button>
            <button
              onClick={() => setFilter("tv")}
              className={`px-4 py-2 rounded-lg transition ${
                filter === "tv" 
                  ? "bg-red-600 text-white" 
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              TV Shows
            </button>
          </div>
        </div>

        {/* Results Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        ) : filteredResults.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {filteredResults.map((item) => (
              <div
                key={`${item.id}-${item.media_type}`}
                className="group cursor-pointer transform transition duration-300 hover:scale-105"
                onClick={() => handleMovieClick(item)}
              >
                <div className="relative rounded-lg overflow-hidden shadow-2xl mb-3">
                  <img
                    src={
                      item.poster_path
                        ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                        : "/placeholder-poster.jpg"
                    }
                    alt={item.title || item.name}
                    className="w-full h-80 object-cover group-hover:opacity-70 transition"
                  />
                  
                  {/* Hover Overlay - Only Trailer and Watch Later */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <button className="bg-white text-black px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 transition block w-full">
                        ▶ Trailer
                      </button>
                      <button
                        onClick={(e) => toggleWatchLater(item.id, e)}
                        className={`px-4 py-2 rounded-lg font-semibold transition block w-full ${
                          watchLater.includes(item.id)
                            ? "bg-white text-black hover:bg-gray-200"
                            : "bg-gray-600 text-white hover:bg-gray-500"
                        }`}
                      >
                        {watchLater.includes(item.id) ? "✓ Added" : "+ Watch Later"}
                      </button>
                    </div>
                  </div>

                  {/* Rating Badge */}
                  <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded text-xs font-semibold">
                    ⭐ {item.vote_average?.toFixed(1)}
                  </div>
                </div>
                
                <h3 className="text-white font-medium line-clamp-2 group-hover:text-red-400 transition mb-1">
                  {item.title || item.name}
                </h3>
                <p className="text-gray-400 text-sm">
                  {item.release_date?.split('-')[0] || item.first_air_date?.split('-')[0] || 'N/A'}
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  {item.media_type === 'movie' ? 'Movie' : 'TV Show'}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold mb-2">No results found</h2>
            <p className="text-gray-400">
              We couldn't find any results for "{query}". Try different keywords.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}