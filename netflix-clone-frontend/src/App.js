// App.js - Add the new routes
import React from "react";
import { HashRouter as Router } from 'react-router-dom';
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PrivateRoute from "./components/PrivateRoute.jsx";
import Watchlist from "./pages/Watchlist";
import MoviePlayer from "./pages/MoviePlayer";
import SearchResults from "./pages/SearchResults";
import MovieDetail from "./pages/MovieDetail";
import ProfileSelector from "./components/ProfileSelector";
import ProfileManagement from "./pages/ProfileManagement";
import Categories from "./pages/Categories";
import TVShows from "./pages/TVShows";
import Movies from "./pages/Movies";
import NewPopular from "./pages/NewPopular";
import MyList from "./pages/MyList";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profiles" element={<ProfileSelector />} />
        <Route path="/profiles/manage" element={<ProfileManagement />} />
        
        {/* Protected Routes */}
        <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/watchlist" element={<PrivateRoute><Watchlist /></PrivateRoute>} />
        <Route path="/search" element={<PrivateRoute><SearchResults /></PrivateRoute>} />
        <Route path="/categories" element={<PrivateRoute><Categories /></PrivateRoute>} />
        <Route path="/tv-shows" element={<PrivateRoute><TVShows /></PrivateRoute>} />
        <Route path="/movies" element={<PrivateRoute><Movies /></PrivateRoute>} />
        <Route path="/new-popular" element={<PrivateRoute><NewPopular /></PrivateRoute>} />
        <Route path="/my-list" element={<PrivateRoute><MyList /></PrivateRoute>} />
        
        {/* Movie routes */}
        <Route path="/movie/:id" element={<PrivateRoute><MovieDetail /></PrivateRoute>} />
        <Route path="/movie/:id/play" element={<PrivateRoute><MoviePlayer /></PrivateRoute>} />
        // In App.js, add these routes:
        <Route path="/tv-shows" element={<PrivateRoute><TVShows /></PrivateRoute>} />
        <Route path="/movies" element={<PrivateRoute><Movies /></PrivateRoute>} />
        <Route path="/new-popular" element={<PrivateRoute><NewPopular /></PrivateRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
