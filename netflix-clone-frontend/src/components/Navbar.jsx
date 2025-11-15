import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_KEY = "7c71e9734e3f6b9753d6d5536489316b";

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [currentProfile, setCurrentProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const profile = JSON.parse(localStorage.getItem('currentProfile'));
    setCurrentProfile(profile);
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchQuery.trim().length > 2) {
      const delayDebounceFn = setTimeout(() => {
        handleSearch(searchQuery);
      }, 500);

      return () => clearTimeout(delayDebounceFn);
    } else {
      setShowSearchResults(false);
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleSearch = async (query) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=1&include_adult=false`
      );
      const data = await response.json();
      setSearchResults(data.results || []);
      setShowSearchResults(true);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSearchResults(false);
      setSearchQuery("");
    }
  };

  const handleResultClick = (media) => {
    navigate(`/movie/${media.id}`);
    setShowSearchResults(false);
    setSearchQuery("");
  };

  const handleProfileSwitch = () => {
    navigate("/profiles");
    setShowProfileMenu(false);
  };

  const handleManageProfiles = () => {
    navigate("/profiles/manage");
    setShowProfileMenu(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("currentProfile");
    localStorage.removeItem("netflixProfiles");
    navigate("/login");
  };

  // Navigation handlers for all menu items
  const handleNavigation = (path) => {
    navigate(path);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowSearchResults(false);
      setShowProfileMenu(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <nav className="bg-gradient-to-b from-black to-transparent p-4 fixed w-full z-50">
      <div className="container mx-auto flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center space-x-8">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg"
            alt="Netflix"
            className="w-24 h-auto cursor-pointer"
            onClick={() => navigate("/")}
          />
          <div className="hidden md:flex space-x-6">
            <button 
              onClick={() => handleNavigation("/")} 
              className="text-white hover:text-gray-300 transition"
            >
              Home
            </button>
            <button 
              onClick={() => handleNavigation("/categories")} 
              className="text-white hover:text-gray-300 transition"
            >
              Categories
            </button>
            <button 
              onClick={() => handleNavigation("/tv-shows")} 
              className="text-white hover:text-gray-300 transition"
            >
              TV Shows
            </button>
            <button 
              onClick={() => handleNavigation("/movies")} 
              className="text-white hover:text-gray-300 transition"
            >
              Movies
            </button>
            <button 
              onClick={() => handleNavigation("/new-popular")} 
              className="text-white hover:text-gray-300 transition"
            >
              New & Popular
            </button>
            <button 
              onClick={() => handleNavigation("/watchlist")} 
              className="text-white hover:text-gray-300 transition"
            >
              My List
            </button>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4 relative">
          {/* Search Bar */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleSearchSubmit} className="flex items-center">
              <input
                type="text"
                placeholder="Search movies and TV shows..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-black/70 border border-gray-600 text-white px-4 py-2 rounded-lg w-64 focus:outline-none focus:border-white transition"
                onClick={(e) => e.stopPropagation()}
              />
              <button
                type="submit"
                className="ml-2 text-white hover:text-gray-300 transition"
              >
                🔍
              </button>
            </form>

            {/* Search Results Dropdown */}
            {showSearchResults && (
              <div className="absolute top-12 left-0 w-96 bg-black/95 border border-gray-700 rounded-lg shadow-2xl max-h-96 overflow-y-auto z-50">
                {isSearching ? (
                  <div className="p-4 text-center text-gray-400">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto mb-2"></div>
                    Searching...
                  </div>
                ) : searchResults.length > 0 ? (
                  <>
                    <div className="p-3 border-b border-gray-700">
                      <p className="text-white font-semibold">Search Results</p>
                    </div>
                    {searchResults.slice(0, 8).map((item) => (
                      <div
                        key={`${item.id}-${item.media_type}`}
                        className="flex items-center p-3 hover:bg-gray-800 cursor-pointer transition"
                        onClick={() => handleResultClick(item)}
                      >
                        <div className="w-12 h-16 bg-gray-700 rounded mr-3 flex items-center justify-center">
                          {item.poster_path ? (
                            <img
                              src={`https://image.tmdb.org/t/p/w92${item.poster_path}`}
                              alt={item.title || item.name}
                              className="w-full h-full object-cover rounded"
                            />
                          ) : (
                            <span className="text-gray-400 text-xs">🎬</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium text-sm">
                            {item.title || item.name}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {item.media_type === 'movie' ? 'Movie' : 'TV Show'} • {item.release_date?.split('-')[0] || item.first_air_date?.split('-')[0] || 'N/A'}
                          </p>
                        </div>
                        <span className="text-gray-400">▶</span>
                      </div>
                    ))}
                    <div 
                      className="p-3 border-t border-gray-700 text-center text-red-400 hover:text-red-300 cursor-pointer"
                      onClick={handleSearchSubmit}
                    >
                      View all results for "{searchQuery}"
                    </div>
                  </>
                ) : (
                  <div className="p-4 text-center text-gray-400">
                    No results found for "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Profile Menu */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-2 text-white hover:text-gray-300 transition"
            >
              {currentProfile && (
                <div 
                  className="w-8 h-8 rounded flex items-center justify-center text-lg"
                  style={{ backgroundColor: currentProfile.color }}
                >
                  {currentProfile.avatar}
                </div>
              )}
              <span className="text-sm">▼</span>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 top-12 w-48 bg-black/95 border border-gray-700 rounded-lg shadow-2xl py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-700">
                  <p className="text-white font-semibold text-sm">{currentProfile?.name}</p>
                </div>
                
                <button
                  onClick={handleProfileSwitch}
                  className="w-full text-left px-4 py-2 text-white hover:bg-gray-800 transition text-sm"
                >
                  Switch Profiles
                </button>
                
                <button
                  onClick={handleManageProfiles}
                  className="w-full text-left px-4 py-2 text-white hover:bg-gray-800 transition text-sm"
                >
                  Manage Profiles
                </button>
                
                <div className="border-t border-gray-700 mt-2 pt-2">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-white hover:bg-gray-800 transition text-sm"
                  >
                    Sign Out of Netflix
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}