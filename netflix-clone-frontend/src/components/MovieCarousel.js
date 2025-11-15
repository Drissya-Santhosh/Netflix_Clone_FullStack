import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_KEY = "7c71e9734e3f6b9753d6d5536489316b";

const MovieCarousel = ({ title, fetchUrl }) => {
  const [movies, setMovies] = useState([]);
  const [trailers, setTrailers] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch(fetchUrl);
        const data = await response.json();
        const moviesList = data.results.slice(0, 10);
        setMovies(moviesList);

        // Fetch trailers for all movies
        moviesList.forEach(movie => fetchMovieTrailer(movie.id));
      } catch (error) {
        console.error("Error fetching movies:", error);
      }
    };

    fetchMovies();
  }, [fetchUrl]);

  const fetchMovieTrailer = async (movieId) => {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${API_KEY}`
      );
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const trailer = data.results.find(
          (video) => video.type === "Trailer" && video.site === "YouTube"
        );

        if (trailer) {
          setTrailers(prev => ({
            ...prev,
            [movieId]: `https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=1&controls=1&modestbranding=1`
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching trailer:", movieId, error);
    }
  };

  const handlePlayTrailer = (movieId, event) => {
    event.stopPropagation();
    const trailerUrl = trailers[movieId];
    if (trailerUrl) {
      window.open(trailerUrl, '_blank');
    }
  };

  const handleMovieClick = (movieId) => {
    navigate(`/movie/${movieId}`);
  };

  return (
    <div className="px-8 py-6">
      <h2 className="text-2xl font-bold mb-4 text-white">{title}</h2>
      <div className="relative">
        <div className="flex space-x-4 overflow-x-auto scrollbar-hide pb-4">
          {movies.map((movie) => (
            <div
              key={movie.id}
              className="flex-none w-64 group relative transition-transform duration-300 hover:scale-105 cursor-pointer"
              onClick={() => handleMovieClick(movie.id)}
            >
              <div className="relative rounded-lg overflow-hidden shadow-2xl">
                <img
                  src={
                    movie.poster_path
                      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                      : "/placeholder-poster.jpg"
                  }
                  alt={movie.title}
                  className="w-full h-80 object-cover"
                />

                {/* Hover Overlay - Only Trailer Button */}
                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  <h3 className="text-white font-semibold text-lg mb-2">
                    {movie.title}
                  </h3>
                  <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                    {movie.overview}
                  </p>

                  <button
                    onClick={(e) => handlePlayTrailer(movie.id, e)}
                    disabled={!trailers[movie.id]}
                    className={`w-full py-2 rounded text-sm font-semibold transition duration-200 ${
                      trailers[movie.id]
                        ? "bg-white text-black hover:bg-gray-200"
                        : "bg-gray-600 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {trailers[movie.id] ? "▶ Trailer" : "No Trailer"}
                  </button>
                </div>

                {/* Rating Badge */}
                <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded text-xs font-semibold">
                  ⭐ {movie.vote_average?.toFixed(1)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MovieCarousel;
