'use client'

import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { Amplify } from 'aws-amplify';
import awsconfig from '../src/aws-exports';
import { getCurrentUser } from 'aws-amplify/auth';
import * as React from 'react';
import ButtonAppBar from './appBar';

Amplify.configure(awsconfig);

function Home() {
  
  const [user, setUser] = React.useState({});

  React.useEffect(() => {
    try {
      getCurrentUser().then((user) => {
        setUser(user);
      });
    }
    catch {
      console.log('No user');
    }
  }, []);

  if (!user.signInDetails) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <ButtonAppBar />
      {console.log("User: ", user)}
      <p>Email: {user.signInDetails.loginId} </p>
    </div>
  );
}

export default withAuthenticator(Home);