"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';


const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null);

  React.useEffect(() => {
    try {
      getCurrentUser().then((user) => {
        setAuth(user);
      });
    }
    catch {
      console.log('No user');
    }
  }, []);

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
