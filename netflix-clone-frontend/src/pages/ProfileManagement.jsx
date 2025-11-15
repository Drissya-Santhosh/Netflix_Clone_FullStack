import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import { 
  getUserProfiles, 
  saveUserProfiles, 
  setCurrentProfile, 
  getRandomColor,
  getCurrentProfile  // Add this import
} from "../utils/profileUtils";
import Navbar from "../components/Navbar";

const ProfileManagement = () => {
  const [profiles, setProfiles] = useState([]);
  const [user, setUser] = useState(null);
  const [editingProfile, setEditingProfile] = useState(null);
  const [newAvatar, setNewAvatar] = useState("");
  const [newName, setNewName] = useState("");
  const navigate = useNavigate();

  const avatars = [
    "👤", "🎭", "🦸", "👨‍💼", "👩‍🎤", "🧙", "🤖", "🐱", "🦊", "🐼",
    "🦁", "🐯", "🐻", "🐨", "🐼", "🐰", "🦄", "🐲", "🚀", "🎮"
  ];

  const colors = [
    "#E50914", "#0080FF", "#00B4B4", "#FF6B00", "#8A2BE2",
    "#FF4081", "#00C853", "#FFD600", "#FF9800", "#9C27B0"
  ];

  useEffect(() => {
    const fetchUserAndProfiles = async () => {
      try {
        const userResponse = await API.get("profile/");
        const userData = userResponse.data;
        setUser(userData);
        
        const userProfiles = getUserProfiles(userData.username);
        setProfiles(userProfiles);
      } catch (error) {
        console.error("Error fetching user:", error);
        navigate('/login');
      }
    };

    fetchUserAndProfiles();
  }, [navigate]);

  const handleSaveProfiles = (updatedProfiles) => {
    if (!user) return;
    
    setProfiles(updatedProfiles);
    saveUserProfiles(user.username, updatedProfiles);
  };

  const handleAddProfile = () => {
    if (!user) return;
    
    const newProfile = {
      id: Date.now(),
      name: `User${profiles.length + 1}`,
      avatar: avatars[profiles.length % avatars.length],
      isKids: false,
      color: getRandomColor()
    };
    
    handleSaveProfiles([...profiles, newProfile]);
  };

  const handleEditProfile = (profileId) => {
    const profile = profiles.find(p => p.id === profileId);
    setEditingProfile(profile);
    setNewName(profile.name);
    setNewAvatar(profile.avatar);
  };

  const handleSaveEdit = () => {
    if (!newName.trim() || !editingProfile || !user) return;

    const updatedProfiles = profiles.map(profile =>
      profile.id === editingProfile.id
        ? { ...profile, name: newName.trim(), avatar: newAvatar }
        : profile
    );

    handleSaveProfiles(updatedProfiles);
    setEditingProfile(null);
    setNewName("");
    setNewAvatar("");
  };

  const handleDeleteProfile = (profileId) => {
    if (!user || profiles.length <= 1) return;
    
    const updatedProfiles = profiles.filter(profile => profile.id !== profileId);
    handleSaveProfiles(updatedProfiles);

    // If deleted profile was current, switch to first profile
    const currentProfile = getCurrentProfile(); // This should work now
    if (currentProfile && currentProfile.id === profileId && updatedProfiles.length > 0) {
      setCurrentProfile(updatedProfiles[0]);
    }
  };

  const handleSetAsKids = (profileId, isKids) => {
    const updatedProfiles = profiles.map(profile =>
      profile.id === profileId ? { ...profile, isKids } : profile
    );
    handleSaveProfiles(updatedProfiles);
  };

  if (editingProfile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="bg-gray-900 p-8 rounded-lg w-96">
          <h2 className="text-2xl font-bold text-white mb-6">Edit Profile</h2>
          
          <div className="flex justify-center mb-6">
            <div 
              className="w-32 h-32 rounded-lg flex items-center justify-center text-5xl"
              style={{ backgroundColor: editingProfile.color }}
            >
              {newAvatar}
            </div>
          </div>

          <div className="mb-6">
            <label className="text-white block mb-2">Choose Avatar:</label>
            <div className="grid grid-cols-5 gap-2 max-h-32 overflow-y-auto">
              {avatars.map((avatar, index) => (
                <button
                  key={index}
                  onClick={() => setNewAvatar(avatar)}
                  className={`text-2xl p-2 rounded ${
                    newAvatar === avatar ? 'bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="text-white block mb-2">Profile Name:</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full p-3 bg-gray-800 text-white rounded"
              maxLength={20}
            />
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handleSaveEdit}
              className="flex-1 bg-red-600 text-white py-3 rounded hover:bg-red-700 transition"
            >
              Save
            </button>
            <button
              onClick={() => setEditingProfile(null)}
              className="flex-1 bg-gray-600 text-white py-3 rounded hover:bg-gray-700 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar />
      
      <div className="pt-20">
        <div className="container mx-auto p-8">
          <h1 className="text-4xl font-bold mb-8">Manage Profiles</h1>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-12">
            {profiles.map((profile) => (
              <div key={profile.id} className="text-center">
                <div className="relative group">
                  <div
                    className="w-32 h-32 rounded-lg flex items-center justify-center text-5xl mx-auto mb-4"
                    style={{ backgroundColor: profile.color }}
                  >
                    {profile.avatar}
                    {profile.isKids && (
                      <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                        Kids
                      </div>
                    )}
                  </div>
                  
                  <div className="absolute inset-0 bg-black/70 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center space-x-2">
                    <button
                      onClick={() => handleEditProfile(profile.id)}
                      className="bg-white text-black p-2 rounded-full hover:bg-gray-200 transition"
                    >
                      ✏️
                    </button>
                    {profile.id !== 1 && (
                      <button
                        onClick={() => handleDeleteProfile(profile.id)}
                        className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
                
                <h3 className="text-white text-lg mb-2">{profile.name}</h3>
                
                <button
                  onClick={() => handleSetAsKids(profile.id, !profile.isKids)}
                  className={`text-sm px-3 py-1 rounded ${
                    profile.isKids 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {profile.isKids ? 'Kids Profile' : 'Set as Kids'}
                </button>
              </div>
            ))}
            
            {profiles.length < 5 && (
              <div
                onClick={handleAddProfile}
                className="flex flex-col items-center cursor-pointer group"
              >
                <div className="w-32 h-32 bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-gray-700 transition duration-200 mb-4">
                  <span className="text-4xl text-gray-400">+</span>
                </div>
                <span className="text-gray-400 group-hover:text-white transition">
                  Add Profile
                </span>
              </div>
            )}
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => navigate("/")}
              className="bg-red-600 text-white px-8 py-3 rounded hover:bg-red-700 transition"
            >
              Done
            </button>
            <button
              onClick={() => navigate("/profiles")}
              className="border border-gray-600 text-gray-400 px-8 py-3 rounded hover:border-white hover:text-white transition"
            >
              Switch Profiles
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileManagement;