import React, { useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await API.post("register/", formData);
      // Save tokens
      localStorage.setItem("access", res.data.tokens.access);
      localStorage.setItem("refresh", res.data.tokens.refresh);
      
      // Clear current profile to force profile selection
      localStorage.removeItem('currentProfile');
      
      // Redirect to profile selector instead of home
      navigate("/profiles");
    } catch (err) {
      setError("Registration failed. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-black text-white">
      {/* Netflix Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')",
        }}
      ></div>

      {/* Enhanced Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/80 to-black/90"></div>

      {/* Netflix Header */}
      <header className="absolute top-0 left-0 w-full z-20 px-8 py-4">
        <div className="flex justify-between items-center">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg"
            alt="Netflix"
            className="w-32 md:w-36 h-auto"
          />
        </div>
      </header>

      {/* Enhanced Register Form */}
      <div className="relative z-10 bg-black/80 px-12 py-12 rounded-lg w-full max-w-md shadow-2xl border border-gray-800">
        <h2 className="text-4xl font-bold mb-8 text-white">Sign Up</h2>

        {error && (
          <p className="text-red-400 text-center mb-6 bg-red-900/30 py-2 rounded">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
          <div className="relative">
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className="w-full p-4 rounded bg-gray-900 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all duration-200 text-white placeholder-gray-400"
              required
            />
          </div>

          <div className="relative">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-4 rounded bg-gray-900 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all duration-200 text-white placeholder-gray-400"
              required
            />
          </div>

          <div className="relative">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-4 rounded bg-gray-900 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all duration-200 text-white placeholder-gray-400"
              required
            />
          </div>

          <div className="relative">
            <input
              type="password"
              name="password2"
              placeholder="Confirm Password"
              value={formData.password2}
              onChange={handleChange}
              className="w-full p-4 rounded bg-gray-900 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all duration-200 text-white placeholder-gray-400"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#e50914] hover:bg-[#f40612] text-white font-semibold py-4 rounded text-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
                Signing Up...
              </div>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-gray-700 mt-6">
          <p className="text-gray-400 text-center">
            Already have an account?{" "}
            <span
              className="text-white hover:text-red-500 cursor-pointer font-semibold transition-colors duration-200"
              onClick={() => navigate("/login")}
            >
              Sign in now.
            </span>
          </p>
        </div>

        <div className="text-xs text-gray-500 text-center pt-2">
          <p>
            This page is protected by Google reCAPTCHA to ensure you're not a bot.{" "}
            <span className="text-blue-400 hover:underline cursor-pointer">
              Learn more.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}