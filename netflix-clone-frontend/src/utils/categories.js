// utils/categories.js
// Remove API_KEY from URLs and make them template-ready

export const movieCategories = [
  {
    id: 'trending',
    name: 'Trending Now',
    type: 'trending'
  },
  {
    id: 'top_rated',
    name: 'Top Rated',
    type: 'category'
  },
  {
    id: 'popular',
    name: 'Popular',
    type: 'category'
  },
  {
    id: 'upcoming',
    name: 'Upcoming',
    type: 'category'
  },
  {
    id: 'now_playing',
    name: 'Now Playing',
    type: 'category'
  }
];

export const genreCategories = [
  {
    id: 28,
    name: 'Action',
    type: 'genre'
  },
  {
    id: 12,
    name: 'Adventure',
    type: 'genre'
  },
  {
    id: 16,
    name: 'Animation',
    type: 'genre'
  },
  {
    id: 35,
    name: 'Comedy',
    type: 'genre'
  },
  {
    id: 80,
    name: 'Crime',
    type: 'genre'
  },
  {
    id: 99,
    name: 'Documentary',
    type: 'genre'
  },
  {
    id: 18,
    name: 'Drama',
    type: 'genre'
  },
  {
    id: 10751,
    name: 'Family',
    type: 'genre'
  },
  {
    id: 14,
    name: 'Fantasy',
    type: 'genre'
  },
  {
    id: 36,
    name: 'History',
    type: 'genre'
  },
  {
    id: 27,
    name: 'Horror',
    type: 'genre'
  },
  {
    id: 10402,
    name: 'Music',
    type: 'genre'
  },
  {
    id: 9648,
    name: 'Mystery',
    type: 'genre'
  },
  {
    id: 10749,
    name: 'Romance',
    type: 'genre'
  },
  {
    id: 878,
    name: 'Science Fiction',
    type: 'genre'
  },
  {
    id: 10770,
    name: 'TV Movie',
    type: 'genre'
  },
  {
    id: 53,
    name: 'Thriller',
    type: 'genre'
  },
  {
    id: 10752,
    name: 'War',
    type: 'genre'
  },
  {
    id: 37,
    name: 'Western',
    type: 'genre'
  }
];

export const allCategories = [...movieCategories, ...genreCategories];

// Helper function to get fetch URL based on category and API key
export const getFetchUrl = (category, apiKey) => {
  const baseUrls = {
    trending: `https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}`,
    top_rated: `https://api.themoviedb.org/3/movie/top_rated?api_key=${apiKey}`,
    popular: `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}`,
    upcoming: `https://api.themoviedb.org/3/movie/upcoming?api_key=${apiKey}`,
    now_playing: `https://api.themoviedb.org/3/movie/now_playing?api_key=${apiKey}`,
  };

  if (category.type === 'trending' || category.type === 'category') {
    return baseUrls[category.id] || baseUrls.trending;
  }

  if (category.type === 'genre') {
    return `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${category.id}`;
  }

  return baseUrls.trending;
};