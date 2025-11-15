import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MovieCarousel from "../components/MovieCarousel";
import Navbar from "../components/Navbar";
import ContinueWatchingCarousel from "../components/ContinueWatchingCarousel";
import { genreCategories } from "../utils/categories";
import { initializeUserProfiles, getCurrentProfile } from "../utils/profileUtils";
import API from "../api/api";

const API_KEY = "7c71e9734e3f6b9753d6d5536489316b";

// Helper function for genre emojis
const getGenreEmoji = (genre) => {
  const emojiMap = {
    'Action': '💥',
    'Adventure': '🗺️',
    'Animation': '🎨',
    'Comedy': '😂',
    'Crime': '🔫',
    'Documentary': '📽️',
    'Drama': '🎭',
    'Family': '👨‍👩‍👧‍👦',
    'Fantasy': '🦄',
    'History': '📜',
    'Horror': '👻',
    'Music': '🎵',
    'Mystery': '🕵️',
    'Romance': '💕',
    'Science Fiction': '🚀',
    'Thriller': '🔪',
    'War': '⚔️',
    'Western': '🤠'
  };
  return emojiMap[genre] || '🎬';
};

export default function Home() {
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [trailerUrl, setTrailerUrl] = useState("");
  const [showTrailer, setShowTrailer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0); // Add this to force carousel refreshes
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user data and initialize profiles
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const profileResponse = await API.get("profile/");
        const userData = profileResponse.data;
        setUser(userData);
        
        // Initialize profiles for this specific user
        initializeUserProfiles(userData.username);
        
        // Load current profile
        const savedProfile = getCurrentProfile();
        if (savedProfile) {
          setCurrentProfile(savedProfile);
        }
        
        fetchFeaturedMovie();
        
        // Generate a new refresh key to force carousels to reload
        setRefreshKey(Date.now());
      } catch (error) {
        console.error("Error fetching user data:", error);
        // If not logged in, redirect to login
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const fetchFeaturedMovie = async () => {
    try {
      // Fetch trending movies
      const moviesResponse = await fetch(
        `https://api.themoviedb.org/3/trending/movie/week?api_key=${API_KEY}`
      );
      const moviesData = await moviesResponse.json();
      
      if (moviesData.results && moviesData.results.length > 0) {
        // Select a random movie from trending (first 10 movies)
        const randomIndex = Math.floor(Math.random() * Math.min(10, moviesData.results.length));
        const movie = moviesData.results[randomIndex];
        setFeaturedMovie(movie);
        
        // Fetch trailer for this movie
        fetchMovieTrailer(movie.id);
      }
    } catch (error) {
      console.error("Error fetching featured movie:", error);
    }
  };

  const fetchMovieTrailer = async (movieId) => {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${API_KEY}`
      );
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        // Find YouTube trailer (prefer official trailer, then teaser, then any trailer)
        const trailer = data.results.find(
          (video) => video.type === "Trailer" && video.site === "YouTube"
        ) || data.results.find(
          (video) => video.type === "Teaser" && video.site === "YouTube"
        ) || data.results[0];
        
        if (trailer) {
          setTrailerUrl(`https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&loop=1&playlist=${trailer.key}`);
        }
      }
    } catch (error) {
      console.error("Error fetching trailer:", error);
    }
  };

  const handlePlayTrailer = () => {
    setShowTrailer(true);
  };

  const handleCloseTrailer = () => {
    setShowTrailer(false);
  };

  const handleSwitchProfile = () => {
    navigate('/profiles');
  };

  const handleRefreshContent = () => {
    // Refresh all content
    fetchFeaturedMovie();
    setRefreshKey(Date.now());
  };

  // Show loading while checking profile
  if (loading) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // If no profile selected but user is loaded, we're redirecting
  if (!currentProfile && user) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Redirecting to profile selection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar />
      
      {/* Welcome Message - Shows Profile Name */}
      {currentProfile && (
        <div className="absolute top-20 left-8 z-30">
          <div className="flex items-center space-x-3 bg-black/50 px-4 py-2 rounded-lg">
            <div 
              className="w-8 h-8 rounded flex items-center justify-center text-sm"
              style={{ backgroundColor: currentProfile.color }}
            >
              {currentProfile.avatar}
            </div>
            <span className="text-white">Welcome, {currentProfile.name}!</span>
            <button 
              onClick={handleSwitchProfile}
              className="text-gray-400 hover:text-white text-sm ml-2"
              title="Switch Profile"
            >
              🔄
            </button>
            <button 
              onClick={handleRefreshContent}
              className="text-gray-400 hover:text-white text-sm ml-2"
              title="Refresh Content"
            >
              🔃
            </button>
          </div>
        </div>
      )}
      
      {/* Hero Section with Trailer/Featured Movie */}
      <div className="relative h-screen">
        {showTrailer && trailerUrl ? (
          // Trailer View
          <div className="absolute inset-0 w-full h-full">
            <iframe
              src={trailerUrl}
              className="w-full h-full"
              frameBorder="0"
              allow="autoplay; encrypted-media"
              allowFullScreen
              title="Movie Trailer"
            />
            <button
              onClick={handleCloseTrailer}
              className="absolute top-4 right-4 bg-black/70 text-white px-4 py-2 rounded-lg hover:bg-black/90 transition duration-200 z-30"
            >
              ✕ Close Trailer
            </button>
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent"></div>
          </div>
        ) : (
          // Featured Movie View
          featuredMovie && (
            <>
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(https://image.tmdb.org/t/p/original${featuredMovie.backdrop_path})`,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
              </div>

              {/* Featured Movie Info */}
              <div className="relative z-10 h-full flex items-center">
                <div className="container mx-auto px-8">
                  <div className="max-w-lg">
                    <h1 className="text-5xl font-bold mb-4">{featuredMovie.title}</h1>
                    <p className="text-lg text-gray-300 mb-6 line-clamp-3">
                      {featuredMovie.overview}
                    </p>
                    <div className="flex space-x-4">
                      <button 
                        onClick={handlePlayTrailer}
                        className="bg-white text-black px-8 py-3 rounded-lg font-semibold hover:bg-gray-200 transition duration-200 flex items-center"
                        disabled={!trailerUrl}
                      >
                        <span className="mr-2">▶</span>
                        {trailerUrl ? "Play Trailer" : "Loading..."}
                      </button>
                      <button 
                        onClick={() => navigate(`/movie/${featuredMovie.id}`)}
                        className="bg-gray-600/70 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-500/70 transition duration-200 flex items-center"
                      >
                        <span className="mr-2">ℹ️</span>
                        More Info
                      </button>
                    </div>
                    {!trailerUrl && !loading && (
                      <p className="text-gray-400 text-sm mt-2">
                        No trailer available for this movie
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )
        )}
      </div>

      {/* Movie Sections */}
      <div className="relative z-20 -mt-32">
        <ContinueWatchingCarousel />
        
        {/* Add random page parameters to force different results */}
        <MovieCarousel
          key={`trending-${refreshKey}`}
          title="Trending Now"
          fetchUrl={`https://api.themoviedb.org/3/trending/movie/week?api_key=${API_KEY}&page=${Math.floor(Math.random() * 5) + 1}`}
        />

        <MovieCarousel
          key={`toprated-${refreshKey}`}
          title="Top Rated"
          fetchUrl={`https://api.themoviedb.org/3/movie/top_rated?api_key=${API_KEY}&page=${Math.floor(Math.random() * 5) + 1}`}
        />

        <MovieCarousel
          key={`action-${refreshKey}`}
          title="Action Movies"
          fetchUrl={`https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=28&page=${Math.floor(Math.random() * 5) + 1}`}
        />

        <MovieCarousel
          key={`comedy-${refreshKey}`}
          title="Comedy Movies"
          fetchUrl={`https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=35&page=${Math.floor(Math.random() * 5) + 1}`}
        />

        <MovieCarousel
          key={`horror-${refreshKey}`}
          title="Horror Movies"
          fetchUrl={`https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=27&page=${Math.floor(Math.random() * 5) + 1}`}
        />

        {/* Add more random genre carousels */}
        <MovieCarousel
          key={`scifi-${refreshKey}`}
          title="Sci-Fi Movies"
          fetchUrl={`https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=878&page=${Math.floor(Math.random() * 5) + 1}`}
        />

        <MovieCarousel
          key={`romance-${refreshKey}`}
          title="Romance Movies"
          fetchUrl={`https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=10749&page=${Math.floor(Math.random() * 5) + 1}`}
        />

        {/* Categories Quick Access Section */}
        <div className="px-8 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Browse by Genre</h2>
            <button 
              onClick={() => navigate("/categories")}
              className="text-red-600 hover:text-red-500 transition font-semibold"
            >
              View All Categories →
            </button>
          </div>
          
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {genreCategories.slice(0, 12).map((category) => (
              <button
                key={category.id}
                onClick={() => navigate("/categories")}
                className="bg-gray-900 hover:bg-gray-800 rounded-lg p-4 text-center transition group"
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                  {getGenreEmoji(category.name)}
                </div>
                <span className="text-sm font-medium">{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}