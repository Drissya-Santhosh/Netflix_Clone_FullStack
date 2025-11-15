import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getWatchlist, removeFromWatchlist } from "../utils/watchlistUtils";

export default function Watchlist() {
  const [watchlist, setWatchlist] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const savedWatchlist = getWatchlist();
    setWatchlist(savedWatchlist);
  }, []);

  const handleRemoveFromWatchlist = (movieId) => {
    removeFromWatchlist(movieId);
    setWatchlist(prev => prev.filter(movie => movie.id !== movieId));
  };

  const handleMovieClick = (movieId) => {
    navigate(`/movie/${movieId}`);
  };

  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar />
      <div className="pt-20 p-8">
        <h1 className="text-4xl font-bold mb-8">My Watchlist</h1>
        
        {watchlist.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📺</div>
            <h2 className="text-2xl font-bold mb-4">Your watchlist is empty</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Start building your watchlist by adding movies and TV shows you want to watch later.
            </p>
            <div className="flex justify-center">
              <button
                onClick={() => navigate("/")}
                className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold transition duration-200 flex items-center justify-center"
              >
                <span className="mr-2">🏠</span>
                Continue Browsing
              </button>
            </div>
            <div className="mt-8 text-gray-500 text-sm">
              <p>Tip: Click the "+ Watch Later" button on any movie to add it to your list</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {watchlist.map((movie) => (
              <div
                key={movie.id}
                className="group cursor-pointer transform transition duration-300 hover:scale-105"
              >
                <div className="relative rounded-lg overflow-hidden shadow-2xl mb-3">
                  <img
                    src={
                      movie.poster_path
                        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                        : "/placeholder-poster.jpg"
                    }
                    alt={movie.title}
                    className="w-full h-80 object-cover group-hover:opacity-70 transition"
                    onClick={() => handleMovieClick(movie.id)}
                  />
                  
                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemoveFromWatchlist(movie.id)}
                    className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition opacity-0 group-hover:opacity-100"
                    title="Remove from watchlist"
                  >
                    ✕
                  </button>

                  {/* Rating Badge */}
                  <div className="absolute top-2 left-2 bg-black/70 px-2 py-1 rounded text-xs font-semibold">
                    ⭐ {movie.vote_average?.toFixed(1)}
                  </div>

                  {/* Watch Later Badge */}
                  <div className="absolute bottom-2 left-2 bg-green-600 text-white px-2 py-1 rounded text-xs font-semibold">
                    ✓ In List
                  </div>
                </div>
                
                <h3 className="text-white font-medium line-clamp-2 group-hover:text-red-400 transition mb-1">
                  {movie.title}
                </h3>
                <p className="text-gray-400 text-sm">
                  {movie.release_date?.split('-')[0] || 'N/A'}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Watchlist Stats */}
        {watchlist.length > 0 && (
          <div className="mt-8 p-6 bg-gray-900/50 rounded-lg">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <div>
                <h3 className="text-xl font-bold mb-2">Your Watchlist</h3>
                <p className="text-gray-400">
                  {watchlist.length} {watchlist.length === 1 ? 'movie' : 'movies'} in your list
                </p>
              </div>
              <button
                onClick={() => navigate("/")}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition duration-200 mt-4 sm:mt-0"
              >
                + Add More Movies
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}