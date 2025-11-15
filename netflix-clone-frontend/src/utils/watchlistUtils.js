// utils/watchlistUtils.js

// Get watchlist for current user
export const getWatchlist = () => {
  const currentProfile = JSON.parse(localStorage.getItem('currentProfile'));
  if (!currentProfile) return [];
  
  const userWatchlistKey = `watchlist_${currentProfile.id}`;
  return JSON.parse(localStorage.getItem(userWatchlistKey)) || [];
};

// Add movie to watchlist
export const addToWatchlist = (movie) => {
  const currentProfile = JSON.parse(localStorage.getItem('currentProfile'));
  if (!currentProfile) return false;
  
  const userWatchlistKey = `watchlist_${currentProfile.id}`;
  const watchlist = getWatchlist();
  
  // Check if movie already exists
  const existingMovie = watchlist.find(item => item.id === movie.id);
  if (existingMovie) return false;
  
  // Add movie to watchlist
  const updatedWatchlist = [...watchlist, movie];
  localStorage.setItem(userWatchlistKey, JSON.stringify(updatedWatchlist));
  return true;
};

// Remove movie from watchlist
export const removeFromWatchlist = (movieId) => {
  const currentProfile = JSON.parse(localStorage.getItem('currentProfile'));
  if (!currentProfile) return false;
  
  const userWatchlistKey = `watchlist_${currentProfile.id}`;
  const watchlist = getWatchlist();
  
  const updatedWatchlist = watchlist.filter(item => item.id !== movieId);
  localStorage.setItem(userWatchlistKey, JSON.stringify(updatedWatchlist));
  return true;
};

// Check if movie is in watchlist
export const isInWatchlist = (movieId) => {
  const watchlist = getWatchlist();
  return watchlist.some(item => item.id === movieId);
};