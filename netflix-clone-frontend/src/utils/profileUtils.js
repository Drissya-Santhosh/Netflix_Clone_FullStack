// utils/profileUtils.js

// Initialize profiles for a new user
export const initializeUserProfiles = (username) => {
  const userProfilesKey = `netflixProfiles_${username}`;
  const currentProfiles = JSON.parse(localStorage.getItem(userProfilesKey));
  
  if (!currentProfiles || currentProfiles.length === 0) {
    // Create default profile for new user
    const defaultProfile = {
      id: 1,
      name: username,
      avatar: "👤",
      isKids: false,
      color: "#E50914"
    };
    
    const profiles = [defaultProfile];
    localStorage.setItem(userProfilesKey, JSON.stringify(profiles));
    localStorage.setItem('currentProfile', JSON.stringify(defaultProfile));
    return profiles;
  }
  
  // If profiles already exist, ensure current profile is set
  const currentProfile = getCurrentProfile();
  if (!currentProfile && currentProfiles.length > 0) {
    setCurrentProfile(currentProfiles[0]);
  }
  
  return currentProfiles;
};

// Get profiles for specific user
export const getUserProfiles = (username) => {
  const userProfilesKey = `netflixProfiles_${username}`;
  const profiles = JSON.parse(localStorage.getItem(userProfilesKey));
  console.log(`Getting profiles for ${username}:`, profiles); // Debug log
  return profiles || [];
};

// Save profiles for specific user
export const saveUserProfiles = (username, profiles) => {
  const userProfilesKey = `netflixProfiles_${username}`;
  console.log(`Saving profiles for ${username}:`, profiles); // Debug log
  localStorage.setItem(userProfilesKey, JSON.stringify(profiles));
};

// Get current profile
export const getCurrentProfile = () => {
  const profile = JSON.parse(localStorage.getItem('currentProfile'));
  console.log('Current profile:', profile); // Debug log
  return profile;
};

// Set current profile
export const setCurrentProfile = (profile) => {
  console.log('Setting current profile:', profile); // Debug log
  localStorage.setItem('currentProfile', JSON.stringify(profile));
};

// Get random color for new profiles
export const getRandomColor = () => {
  const colors = [
    "#E50914", "#0080FF", "#00B4B4", "#FF6B00", 
    "#8A2BE2", "#FF4081", "#00C853", "#FFD600"
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};