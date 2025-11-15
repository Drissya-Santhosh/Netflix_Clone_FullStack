import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import { getUserProfiles, saveUserProfiles, setCurrentProfile, getCurrentProfile, getRandomColor } from "../utils/profileUtils";

const ProfileSelector = () => {
  const [profiles, setProfiles] = useState([]);
  const [isManaging, setIsManaging] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Default avatars
  const defaultAvatars = [
    "👤", "🎭", "🦸", "👨‍💼", "👩‍🎤", "🧙", "🤖", "🐱", "🦊", "🐼"
  ];

  useEffect(() => {
    const fetchUserAndProfiles = async () => {
      try {
        console.log("Fetching user data..."); // Debug log
        const userResponse = await API.get("profile/");
        const userData = userResponse.data;
        console.log("User data:", userData); // Debug log
        setUser(userData);
        
        // Load profiles for this specific user
        const userProfiles = getUserProfiles(userData.username);
        console.log("Loaded user profiles:", userProfiles); // Debug log
        
        if (userProfiles.length === 0) {
          console.log("No profiles found, creating default..."); // Debug log
          // Create default profile
          const defaultProfile = {
            id: Date.now(),
            name: userData.username,
            avatar: "👤",
            isKids: false,
            color: "#E50914"
          };
          const newProfiles = [defaultProfile];
          setProfiles(newProfiles);
          saveUserProfiles(userData.username, newProfiles);
          setCurrentProfile(defaultProfile);
        } else {
          console.log("Setting existing profiles:", userProfiles); // Debug log
          setProfiles(userProfiles);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndProfiles();
  }, [navigate]);

  const handleProfileSelect = (profile) => {
    console.log("Profile selected:", profile); // Debug log
    setCurrentProfile(profile);
    navigate("/");
  };

  const handleAddProfile = () => {
    if (!user) return;
    
    const newProfile = {
      id: Date.now(),
      name: `User${profiles.length + 1}`,
      avatar: defaultAvatars[profiles.length % defaultAvatars.length],
      isKids: false,
      color: getRandomColor()
    };
    
    const updatedProfiles = [...profiles, newProfile];
    console.log("Adding new profile. Updated profiles:", updatedProfiles); // Debug log
    setProfiles(updatedProfiles);
    saveUserProfiles(user.username, updatedProfiles);
  };

  const handleEditProfile = (profileId, updates) => {
    if (!user) return;
    
    const updatedProfiles = profiles.map(profile =>
      profile.id === profileId ? { ...profile, ...updates } : profile
    );
    console.log("Editing profile. Updated profiles:", updatedProfiles); // Debug log
    setProfiles(updatedProfiles);
    saveUserProfiles(user.username, updatedProfiles);
  };

  const handleDeleteProfile = (profileId) => {
    if (!user || profiles.length <= 1) return;
    
    const updatedProfiles = profiles.filter(profile => profile.id !== profileId);
    console.log("Deleting profile. Updated profiles:", updatedProfiles); // Debug log
    setProfiles(updatedProfiles);
    saveUserProfiles(user.username, updatedProfiles);
    
    // If deleted profile was current, switch to first profile
    const currentProfile = getCurrentProfile();
    if (currentProfile && currentProfile.id === profileId && updatedProfiles.length > 0) {
      setCurrentProfile(updatedProfiles[0]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading profiles...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <p>Error loading user data</p>
          <button 
            onClick={() => navigate('/login')}
            className="mt-4 bg-red-600 px-4 py-2 rounded hover:bg-red-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg"
          alt="Netflix"
          className="w-40 mx-auto mb-12"
        />
        
        <h1 className="text-4xl font-bold text-white mb-12">
          {isManaging ? "Manage Profiles" : "Who's watching?"}
        </h1>

        <div className="flex flex-wrap justify-center gap-8 mb-12 max-w-4xl mx-auto">
          {profiles.map((profile) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              onSelect={handleProfileSelect}
              onEdit={handleEditProfile}
              onDelete={handleDeleteProfile}
              isManaging={isManaging}
            />
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

        <button
          onClick={() => setIsManaging(!isManaging)}
          className="border border-gray-600 text-gray-400 px-8 py-3 text-lg hover:border-white hover:text-white transition duration-200"
        >
          {isManaging ? "Done" : "Manage Profiles"}
        </button>

        {/* Debug info - remove in production */}
        <div className="mt-8 text-gray-500 text-sm">
          <p>User: {user?.username}</p>
          <p>Profiles count: {profiles.length}</p>
          <button 
            onClick={() => {
              console.log('Current localStorage:', localStorage);
              console.log('Profiles in state:', profiles);
              console.log('User profiles from storage:', getUserProfiles(user?.username));
            }}
            className="mt-2 text-xs bg-gray-800 px-2 py-1 rounded"
          >
            Debug Info
          </button>
        </div>
      </div>
    </div>
  );
};

const ProfileCard = ({ profile, onSelect, onEdit, onDelete, isManaging }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(profile.name);

  const handleSave = () => {
    if (editName.trim()) {
      onEdit(profile.id, { name: editName.trim() });
      setIsEditing(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  if (isManaging) {
    return (
      <div className="flex flex-col items-center">
        <div className="relative group">
          <div
            className="w-32 h-32 rounded-lg flex items-center justify-center text-5xl mb-4 relative"
            style={{ backgroundColor: profile.color }}
          >
            {profile.avatar}
            {profile.isKids && (
              <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                Kids
              </div>
            )}
          </div>
          
          {/* Edit/Delete Buttons */}
          <div className="absolute inset-0 bg-black/70 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center space-x-2">
            <button
              onClick={() => setIsEditing(true)}
              className="bg-white text-black p-2 rounded-full hover:bg-gray-200 transition"
            >
              ✏️
            </button>
            {profile.id !== 1 && ( // Don't allow deleting the first profile
              <button
                onClick={() => onDelete(profile.id)}
                className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition"
              >
                🗑️
              </button>
            )}
          </div>
        </div>

        {isEditing ? (
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyPress={handleKeyPress}
              className="bg-gray-800 text-white px-2 py-1 rounded text-center w-24"
              autoFocus
            />
            <button
              onClick={handleSave}
              className="bg-green-600 text-white p-1 rounded"
            >
              ✓
            </button>
          </div>
        ) : (
          <span className="text-white text-lg">{profile.name}</span>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={() => onSelect(profile)}
      className="flex flex-col items-center cursor-pointer group transform transition duration-200 hover:scale-110"
    >
      <div
        className="w-32 h-32 rounded-lg flex items-center justify-center text-5xl mb-4 relative group-hover:border-4 group-hover:border-white transition-all duration-200"
        style={{ backgroundColor: profile.color }}
      >
        {profile.avatar}
        {profile.isKids && (
          <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
            Kids
          </div>
        )}
      </div>
      <span className="text-gray-400 group-hover:text-white transition text-lg">
        {profile.name}
      </span>
    </div>
  );
};

export default ProfileSelector;