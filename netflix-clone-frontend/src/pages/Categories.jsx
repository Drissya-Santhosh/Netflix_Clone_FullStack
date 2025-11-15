import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { movieCategories, genreCategories, getFetchUrl } from "../utils/categories";

const API_KEY = "7c71e9734e3f6b9753d6d5536489316b";

export default function Categories() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('popularity.desc');
  const [yearFilter, setYearFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [watchLater, setWatchLater] = useState([]);
  const navigate = useNavigate();

  const sortOptions = [
    { value: 'popularity.desc', label: 'Most Popular' },
    { value: 'popularity.asc', label: 'Least Popular' },
    { value: 'release_date.desc', label: 'Newest First' },
    { value: 'release_date.asc', label: 'Oldest First' },
    { value: 'vote_average.desc', label: 'Highest Rated' },
    { value: 'vote_average.asc', label: 'Lowest Rated' },
    { value: 'title.asc', label: 'Title A-Z' },
    { value: 'title.desc', label: 'Title Z-A' }
  ];

  useEffect(() => {
    // Set default category to Trending
    if (movieCategories.length > 0) {
      setSelectedCategory({...movieCategories[0], fetchUrl: getFetchUrl(movieCategories[0], API_KEY)});
    }
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchCategoryMovies();
    }
  }, [selectedCategory, currentPage, sortBy, yearFilter, ratingFilter]);

  const fetchCategoryMovies = async () => {
    if (!selectedCategory) return;

    setLoading(true);
    try {
      let url = getFetchUrl(selectedCategory, API_KEY);
      
      // Add filters for genre categories
      if (selectedCategory.type === 'genre') {
        url += `&sort_by=${sortBy}&page=${currentPage}`;
        
        if (yearFilter) {
          url += `&primary_release_year=${yearFilter}`;
        }
        
        if (ratingFilter) {
          url += `&vote_average.gte=${ratingFilter}`;
        }
      } else {
        url += `&page=${currentPage}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      setMovies(data.results || []);
      setTotalPages(data.total_pages > 500 ? 500 : data.total_pages);
    } catch (error) {
      console.error("Error fetching category movies:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (category) => {
    const categoryWithUrl = {
      ...category,
      fetchUrl: getFetchUrl(category, API_KEY)
    };
    setSelectedCategory(categoryWithUrl);
    setCurrentPage(1);
    setMovies([]);
  };

  const handleMovieClick = (movieId) => {
    navigate(`/movie/${movieId}`);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSortBy('popularity.desc');
    setYearFilter('');
    setRatingFilter('');
    setCurrentPage(1);
  };

  const toggleWatchLater = (movieId, event) => {
    event.stopPropagation();
    setWatchLater((prev) =>
      prev.includes(movieId)
        ? prev.filter((id) => id !== movieId)
        : [...prev, movieId]
    );
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar />
      
      <div className="pt-20">
        {/* Header */}
        <div className="container mx-auto px-8 py-8">
          <h1 className="text-4xl font-bold mb-2">Browse Movies</h1>
          <p className="text-gray-400">Discover movies by category and genre</p>
        </div>

        <div className="container mx-auto px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar - Categories */}
            <div className="lg:w-80 flex-shrink-0">
              <div className="bg-gray-900/50 rounded-lg p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-4">Categories</h2>
                
                {/* Movie Categories */}
                <div className="mb-6">
                  <h3 className="text-gray-400 text-sm font-semibold mb-3 uppercase tracking-wide">
                    Movies
                  </h3>
                  <div className="space-y-2">
                    {movieCategories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => handleCategorySelect(category)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition ${
                          selectedCategory?.id === category.id
                            ? 'bg-red-600 text-white'
                            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Genre Categories */}
                <div>
                  <h3 className="text-gray-400 text-sm font-semibold mb-3 uppercase tracking-wide">
                    Genres
                  </h3>
                  <div className="space-y-2">
                    {genreCategories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => handleCategorySelect(category)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition ${
                          selectedCategory?.id === category.id
                            ? 'bg-red-600 text-white'
                            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Category Header and Filters */}
              {selectedCategory && (
                <div className="bg-gray-900/50 rounded-lg p-6 mb-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold">
                        {selectedCategory.name}
                      </h2>
                      <p className="text-gray-400">
                        {movies.length > 0 && `Showing ${movies.length} movies`}
                      </p>
                    </div>

                    {/* Filters - Only show for genre categories */}
                    {selectedCategory.type === 'genre' && (
                      <div className="flex flex-wrap gap-4">
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="bg-gray-800 text-white px-3 py-2 rounded border border-gray-600 focus:outline-none focus:border-red-500"
                        >
                          {sortOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>

                        <select
                          value={yearFilter}
                          onChange={(e) => setYearFilter(e.target.value)}
                          className="bg-gray-800 text-white px-3 py-2 rounded border border-gray-600 focus:outline-none focus:border-red-500"
                        >
                          <option value="">All Years</option>
                          {years.map(year => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>

                        <select
                          value={ratingFilter}
                          onChange={(e) => setRatingFilter(e.target.value)}
                          className="bg-gray-800 text-white px-3 py-2 rounded border border-gray-600 focus:outline-none focus:border-red-500"
                        >
                          <option value="">All Ratings</option>
                          <option value="8">8+ Stars</option>
                          <option value="7">7+ Stars</option>
                          <option value="6">6+ Stars</option>
                          <option value="5">5+ Stars</option>
                        </select>

                        <button
                          onClick={clearFilters}
                          className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Movies Grid */}
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {movies.map((movie) => (
                      <div
                        key={movie.id}
                        className="group cursor-pointer transform transition duration-300 hover:scale-105"
                        onClick={() => handleMovieClick(movie.id)}
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
                          />
                          
                          {/* Hover Overlay - Only Trailer and Watch Later */}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <div className="text-center space-y-2">
                              <button className="bg-white text-black px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 transition block w-full">
                                ▶ Trailer
                              </button>
                              <button
                                onClick={(e) => toggleWatchLater(movie.id, e)}
                                className={`px-4 py-2 rounded-lg font-semibold transition block w-full ${
                                  watchLater.includes(movie.id)
                                    ? "bg-white text-black hover:bg-gray-200"
                                    : "bg-gray-600 text-white hover:bg-gray-500"
                                }`}
                              >
                                {watchLater.includes(movie.id) ? "✓ Added" : "+ Watch Later"}
                              </button>
                            </div>
                          </div>

                          {/* Rating Badge */}
                          <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded text-xs font-semibold">
                            ⭐ {movie.vote_average?.toFixed(1)}
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

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center space-x-2 mt-12">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-gray-800 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition"
                      >
                        Previous
                      </button>
                      
                      <div className="flex space-x-2">
                        {[...Array(Math.min(5, totalPages))].map((_, index) => {
                          const pageNum = currentPage <= 3 
                            ? index + 1 
                            : currentPage - 2 + index;
                          
                          if (pageNum > totalPages) return null;
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`w-10 h-10 rounded ${
                                currentPage === pageNum
                                  ? 'bg-red-600 text-white'
                                  : 'bg-gray-800 text-white hover:bg-gray-700'
                              } transition`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-gray-800 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* No Results */}
              {!loading && movies.length === 0 && selectedCategory && (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">🎬</div>
                  <h2 className="text-2xl font-bold mb-2">No movies found</h2>
                  <p className="text-gray-400">
                    Try adjusting your filters or select a different category.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}