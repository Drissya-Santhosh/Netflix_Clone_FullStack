import React, { useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await API.post("token/", { username, password });
      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);
      
      // Clear current profile to force profile selection
      localStorage.removeItem('currentProfile');
      
      // Redirect to profile selector instead of home
      navigate("/profiles");
    } catch (err) {
      alert("Invalid credentials. Try again.");
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

      {/* Enhanced Login Form */}
      <div className="relative z-10 bg-black/80 px-12 py-12 rounded-lg w-full max-w-md shadow-2xl border border-gray-800">
        <h2 className="text-4xl font-bold mb-8 text-white">Sign In</h2>
        
        <form onSubmit={handleLogin} className="flex flex-col space-y-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Email or phone number"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-4 rounded bg-gray-900 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all duration-200 text-white placeholder-gray-400"
              required
            />
          </div>
          
          <div className="relative">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
                Signing In...
              </div>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Additional Netflix-style Options */}
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between text-gray-400 text-sm">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 bg-gray-800 border-gray-600 rounded" />
              <span>Remember me</span>
            </label>
            <span className="hover:text-white cursor-pointer transition-colors duration-200">
              Need help?
            </span>
          </div>

          <div className="pt-4 border-t border-gray-700">
            <p className="text-gray-400 text-center">
              New to Netflix?{" "}
              <span
                className="text-white hover:text-red-500 cursor-pointer font-semibold transition-colors duration-200"
                onClick={() => navigate("/register")}
              >
                Sign up now.
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
    </div>
  );
}