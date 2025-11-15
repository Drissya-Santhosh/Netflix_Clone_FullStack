import React, { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import API from "../api/api";

const API_KEY = "7c71e9734e3f6b9753d6d5536489316b";

export default function MoviePlayer() {
  const { movieId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const videoRef = useRef(null);

  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [movieDetails, setMovieDetails] = useState(null);
  const [trailerUrl, setTrailerUrl] = useState("");
  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const movieTitle = location.state?.title || movieDetails?.title || "Unknown Movie";
  const posterPath = location.state?.poster_path || movieDetails?.poster_path || "";

  useEffect(() => {
    fetchMovieDetails();
  }, [movieId]);

  useEffect(() => {
    let progressInterval;
    
    if (isPlaying) {
      progressInterval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev < 100 ? prev + 1 : 100;
          
          // Save progress every 5%
          if (newProgress % 5 === 0 && newProgress > 0) {
            saveProgress(newProgress);
          }
          
          return newProgress;
        });
        
        setCurrentTime((prev) => prev + 1);
      }, 3000); // Update every 3 seconds for simulation
    }

    return () => clearInterval(progressInterval);
  }, [isPlaying]);

  const fetchMovieDetails = async () => {
    try {
      // Fetch movie details from TMDB
      const movieResponse = await fetch(
        `https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}`
      );
      const movieData = await movieResponse.json();
      setMovieDetails(movieData);

      // Fetch trailer
      const trailerResponse = await fetch(
        `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${API_KEY}`
      );
      const trailerData = await trailerResponse.json();
      const trailer = trailerData.results?.find(
        video => video.type === "Trailer" && video.site === "YouTube"
      );
      if (trailer) {
        setTrailerUrl(`https://www.youtube.com/embed/${trailer.key}?autoplay=1&controls=0`);
      }
    } catch (error) {
      console.error("Error fetching movie details:", error);
    }
  };

  const saveProgress = async (progressValue) => {
    try {
      await API.post("continue-watching/", {
        movie_id: movieId,
        title: movieTitle,
        poster_path: posterPath,
        progress: progressValue,
      }).catch(async () => {
        // If record exists, update instead
        await API.patch(`continue-watching/${movieId}/`, { progress: progressValue });
      });
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    setShowControls(true);
    setTimeout(() => setShowControls(false), 3000);
  };

  const handleSeek = (newProgress) => {
    setProgress(newProgress);
    setCurrentTime((newProgress / 100) * duration);
    saveProgress(newProgress);
  };

  const handleBackToMovie = () => {
    navigate(`/movie/${movieId}/details`);
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Simulate video duration
  useEffect(() => {
    setDuration(120 * 60); // 2 hours in seconds for simulation
  }, []);

  // Auto-hide controls
  useEffect(() => {
    if (showControls) {
      const timer = setTimeout(() => {
        setShowControls(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showControls]);

  if (trailerUrl) {
    return (
      <div className="relative bg-black h-screen">
        {/* YouTube Trailer */}
        <iframe
          src={trailerUrl}
          className="w-full h-full"
          frameBorder="0"
          allow="autoplay; encrypted-media; fullscreen"
          allowFullScreen
          title="Movie Trailer"
        />
        
        {/* Overlay Controls */}
        <div 
          className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/80 transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(false)}
        >
          {/* Top Bar */}
          <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center">
            <button
              onClick={handleBackToMovie}
              className="text-white hover:text-gray-300 transition duration-200 flex items-center space-x-2"
            >
              <span className="text-2xl">←</span>
              <span className="text-lg">Back to Movie</span>
            </button>
            
            <button
              onClick={handleBackToHome}
              className="text-white hover:text-gray-300 transition duration-200"
            >
              <span className="text-2xl">✕</span>
            </button>
          </div>

          {/* Center Play/Pause Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={handlePlayPause}
              className="bg-white/20 backdrop-blur-sm rounded-full p-4 hover:bg-white/30 transition duration-200"
            >
              <span className="text-white text-4xl">
                {isPlaying ? '⏸️' : '▶️'}
              </span>
            </button>
          </div>

          {/* Bottom Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            {/* Progress Bar */}
            <div className="mb-4">
              <div 
                className="w-full bg-gray-600 h-1 rounded cursor-pointer"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickPosition = (e.clientX - rect.left) / rect.width;
                  handleSeek(clickPosition * 100);
                }}
              >
                <div
                  className="bg-red-600 h-1 rounded transition-all duration-200"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-gray-300 text-sm mt-2">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex justify-between items-center">
              <div className="flex space-x-4">
                <button
                  onClick={handlePlayPause}
                  className="text-white hover:text-gray-300 transition duration-200"
                >
                  {isPlaying ? '⏸️ Pause' : '▶️ Play'}
                </button>
                <button className="text-white hover:text-gray-300 transition duration-200">
                  ⏭️ 10s
                </button>
              </div>
              
              <div className="flex space-x-4">
                <button className="text-white hover:text-gray-300 transition duration-200">
                  🔊
                </button>
                <button className="text-white hover:text-gray-300 transition duration-200">
                  ⛶
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Progress completion message */}
        {progress >= 100 && (
          <div className="absolute inset-0 bg-black/90 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold mb-4">Movie Completed!</h2>
              <p className="text-gray-300 mb-6">You've finished watching {movieTitle}</p>
              <div className="flex space-x-4 justify-center">
                <button
                  onClick={handleBackToMovie}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition duration-200"
                >
                  Movie Details
                </button>
                <button
                  onClick={handleBackToHome}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition duration-200"
                >
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Fallback view when no trailer is available
  return (
    <div className="bg-black min-h-screen text-white flex flex-col items-center justify-center p-8">
      <div className="text-center max-w-2xl">
        <div className="text-6xl mb-6">🎬</div>
        <h1 className="text-4xl font-bold mb-4">{movieTitle}</h1>
        
        {posterPath && (
          <img
            src={posterPath.startsWith('http') ? posterPath : `https://image.tmdb.org/t/p/w500${posterPath}`}
            alt={movieTitle}
            className="w-64 h-96 object-cover rounded-lg mx-auto mb-6"
          />
        )}

        {/* Simulated Video Player */}
        <div className="bg-gray-800 w-full h-64 rounded-lg mb-6 flex items-center justify-center relative">
          <div className="text-center">
            <div className="text-4xl mb-2">{isPlaying ? '▶️' : '⏸️'}</div>
            <p className="text-gray-400">Video Player Simulation</p>
            <p className="text-sm text-gray-500 mt-2">
              {trailerUrl ? 'Trailer available' : 'No trailer available for this movie'}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="w-full bg-gray-600 h-2 rounded mb-2">
              <div
                className="bg-red-600 h-2 rounded transition-all duration-200"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-gray-400">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex space-x-4 justify-center mb-6">
          <button
            onClick={handlePlayPause}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition duration-200"
          >
            {isPlaying ? '⏸️ Pause' : '▶️ Play'}
          </button>
          <button
            onClick={handleBackToMovie}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition duration-200"
          >
            Movie Details
          </button>
          <button
            onClick={handleBackToHome}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition duration-200"
          >
            Back to Home
          </button>
        </div>

        <p className="text-gray-400 mb-4">
          Progress: {progress}% • {Math.round(currentTime / 60)} minutes watched
        </p>

        {progress >= 100 && (
          <div className="bg-green-600/20 border border-green-600 rounded-lg p-4 mb-6">
            <p className="text-green-400 font-semibold">
              🎉 Congratulations! You've completed this movie.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}