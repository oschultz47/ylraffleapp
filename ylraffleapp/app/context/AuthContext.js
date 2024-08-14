"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';
import LoadingScreen from '../LoadingScreen';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuthState = async () => {
      try {
        const user = await getCurrentUser();
        setAuth(user);
      } catch (error) {
        console.log('No user authenticated:', error);
      } finally {
        setLoading(false); // Ensure loading state is updated
      }
    };

    fetchAuthState();
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
