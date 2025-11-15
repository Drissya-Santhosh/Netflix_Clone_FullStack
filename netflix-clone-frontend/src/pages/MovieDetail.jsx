import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { addToWatchlist, removeFromWatchlist, isInWatchlist } from "../utils/watchlistUtils";

const API_KEY = "7c71e9734e3f6b9753d6d5536489316b";

export default function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [trailer, setTrailer] = useState("");
  const [cast, setCast] = useState([]);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showTrailer, setShowTrailer] = useState(false);
  const [watchLater, setWatchLater] = useState(false);

  useEffect(() => {
    if (id) {
      fetchMovieData();
    }
  }, [id]);

  useEffect(() => {
    if (movie) {
      setWatchLater(isInWatchlist(movie.id));
    }
  }, [movie]);

  const fetchMovieData = async () => {
    try {
      setLoading(true);
      
      // Fetch movie details
      const movieResponse = await fetch(
        `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&append_to_response=credits,videos,recommendations`
      );
      
      if (!movieResponse.ok) {
        throw new Error('Movie not found');
      }
      
      const movieData = await movieResponse.json();
      setMovie(movieData);

      // Fetch trailer
      if (movieData.videos?.results) {
        const trailerData = movieData.videos.results.find(
          (video) => video.type === "Trailer" && video.site === "YouTube"
        );
        if (trailerData) {
          setTrailer(trailerData.key);
        }
      }

      // Fetch cast
      if (movieData.credits?.cast) {
        setCast(movieData.credits.cast.slice(0, 12));
      }

      // Fetch similar movies
      const similarResponse = await fetch(
        `https://api.themoviedb.org/3/movie/${id}/similar?api_key=${API_KEY}`
      );
      const similarData = await similarResponse.json();
      setSimilarMovies(similarData.results?.slice(0, 12) || []);

    } catch (error) {
      console.error("Error fetching movie data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatRuntime = (minutes) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const handlePlayTrailer = () => {
    if (trailer) {
      setShowTrailer(true);
    }
  };

  const toggleWatchLater = () => {
    if (!movie) return;
    
    if (isInWatchlist(movie.id)) {
      // Remove from watchlist
      removeFromWatchlist(movie.id);
      setWatchLater(false);
    } else {
      // Add to watchlist
      addToWatchlist({
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        backdrop_path: movie.backdrop_path,
        overview: movie.overview,
        release_date: movie.release_date,
        vote_average: movie.vote_average,
        genre_ids: movie.genres?.map(genre => genre.id) || []
      });
      setWatchLater(true);
    }
  };

  if (loading) {
    return (
      <div className="bg-black min-h-screen text-white">
        <Navbar />
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="bg-black min-h-screen text-white">
        <Navbar />
        <div className="text-center pt-32">
          <h1 className="text-2xl">Movie not found</h1>
          <button 
            onClick={() => navigate("/")}
            className="mt-4 bg-red-600 px-6 py-2 rounded hover:bg-red-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative h-96 lg:h-screen/75">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdrop_path || movie.poster_path})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
        </div>

        <div className="relative z-10 container mx-auto px-8 h-full flex items-end pb-16">
          <div className="max-w-4xl">
            <h1 className="text-4xl lg:text-6xl font-bold mb-4">
              {movie.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mb-6 text-lg">
              <span className="flex items-center">
                ⭐ {movie.vote_average?.toFixed(1) || 'N/A'}/10
              </span>
              <span>{movie.release_date?.split('-')[0] || 'N/A'}</span>
              <span>{formatRuntime(movie.runtime)}</span>
              <span className="border border-gray-400 px-2 py-1 text-sm rounded">
                {movie.adult ? 'R' : 'PG-13'}
              </span>
            </div>
            
            <div className="flex flex-wrap gap-4 mb-6">
              {movie.genres?.map(genre => (
                <span key={genre.id} className="bg-red-600 px-3 py-1 rounded-full text-sm">
                  {genre.name}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap gap-4">
              <button 
                onClick={handlePlayTrailer}
                disabled={!trailer}
                className="bg-white text-black px-8 py-3 rounded-lg font-semibold hover:bg-gray-200 transition flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="mr-2">▶</span>
                {trailer ? "Play Trailer" : "No Trailer"}
              </button>
              <button 
                onClick={toggleWatchLater}
                className={`px-8 py-3 rounded-lg font-semibold transition flex items-center ${
                  watchLater 
                    ? "bg-white text-black hover:bg-gray-200" 
                    : "bg-gray-600/70 text-white hover:bg-gray-500/70"
                }`}
              >
                <span className="mr-2">{watchLater ? "✓" : "+"}</span>
                {watchLater ? "Added to Watchlist" : "Add to Watchlist"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Trailer Modal */}
      {showTrailer && trailer && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl">
            <button
              onClick={() => setShowTrailer(false)}
              className="absolute -top-12 right-0 text-white text-2xl hover:text-gray-300"
            >
              ✕ Close
            </button>
            <div className="aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${trailer}?autoplay=1`}
                className="w-full h-full rounded-lg"
                frameBorder="0"
                allow="autoplay; encrypted-media"
                allowFullScreen
                title="Movie Trailer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Content Section */}
      <div className="container mx-auto px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tab Navigation */}
            <div className="border-b border-gray-700 mb-8">
              <div className="flex space-x-8">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`pb-4 font-semibold transition ${
                    activeTab === "overview"
                      ? "text-white border-b-2 border-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab("cast")}
                  className={`pb-4 font-semibold transition ${
                    activeTab === "cast"
                      ? "text-white border-b-2 border-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Cast & Crew
                </button>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === "overview" && (
              <div>
                <h3 className="text-2xl font-bold mb-4">Storyline</h3>
                <p className="text-gray-300 text-lg leading-relaxed">
                  {movie.overview || "No overview available."}
                </p>
                
                {/* Key Facts */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
                  <div>
                    <h4 className="text-gray-400 text-sm">Status</h4>
                    <p className="font-semibold">{movie.status || 'N/A'}</p>
                  </div>
                  <div>
                    <h4 className="text-gray-400 text-sm">Original Language</h4>
                    <p className="font-semibold">
                      {movie.original_language?.toUpperCase() || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-gray-400 text-sm">Budget</h4>
                    <p className="font-semibold">
                      {movie.budget ? `$${movie.budget.toLocaleString()}` : "N/A"}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-gray-400 text-sm">Revenue</h4>
                    <p className="font-semibold">
                      {movie.revenue ? `$${movie.revenue.toLocaleString()}` : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "cast" && (
              <div>
                <h3 className="text-2xl font-bold mb-6">Cast</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {cast.map((person) => (
                    <div key={person.id} className="text-center">
                      <img
                        src={
                          person.profile_path
                            ? `https://image.tmdb.org/t/p/w185${person.profile_path}`
                            : "/placeholder-actor.jpg"
                        }
                        alt={person.name}
                        className="w-32 h-32 object-cover rounded-full mx-auto mb-3"
                      />
                      <h4 className="font-semibold">{person.name}</h4>
                      <p className="text-gray-400 text-sm">{person.character}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Poster */}
            <div className="text-center">
              <img
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
                className="w-64 mx-auto rounded-lg shadow-2xl"
              />
            </div>

            {/* Quick Stats */}
            <div className="bg-gray-900/50 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">Quick Facts</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Release Date</span>
                  <span>{movie.release_date ? new Date(movie.release_date).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Rating</span>
                  <span>{movie.vote_average?.toFixed(1) || 'N/A'}/10</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Votes</span>
                  <span>{movie.vote_count?.toLocaleString() || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Popularity</span>
                  <span>{movie.popularity?.toFixed(0) || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Movies */}
        {similarMovies.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold mb-6">More Like This</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {similarMovies.map((similarMovie) => (
                <div
                  key={similarMovie.id}
                  className="cursor-pointer group transform transition duration-300 hover:scale-105"
                  onClick={() => navigate(`/movie/${similarMovie.id}`)}
                >
                  <img
                    src={
                      similarMovie.poster_path
                        ? `https://image.tmdb.org/t/p/w300${similarMovie.poster_path}`
                        : "/placeholder-poster.jpg"
                    }
                    alt={similarMovie.title}
                    className="w-full h-64 object-cover rounded-lg mb-3"
                  />
                  <h3 className="text-white font-medium line-clamp-2 group-hover:text-red-400 transition">
                    {similarMovie.title}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {similarMovie.release_date?.split('-')[0]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}