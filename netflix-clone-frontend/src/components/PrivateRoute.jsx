// components/PrivateRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const accessToken = localStorage.getItem("access");
  
  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

export default PrivateRoute;