'use client'

import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { Amplify } from 'aws-amplify';
import awsconfig from '../src/aws-exports';
import { getCurrentUser } from 'aws-amplify/auth';
import * as React from 'react';
import ButtonAppBar from './appBar';
import { useAuth } from './context/AuthContext';
import './home.css'; // Import your stylesheet

Amplify.configure(awsconfig);

function Home() {

  const { auth, setAuth } = useAuth();

  React.useEffect(() => {
    try {
      getCurrentUser().then((user) => {
        setAuth(user);
      });
    } catch {
      console.error('No user');
    }
  }, []);
  
  if (auth == null) {
    return <div>Loading...</div>;
  }

  return (
    <div className="app-container">
      <ButtonAppBar />
      <div className="home-container">
        <div className="text-box">
          <h1 className="welcome-text">Welcome to BVYL Raffle!</h1>
        </div>
      </div>
    </div>
  );
}

export default withAuthenticator(Home);
