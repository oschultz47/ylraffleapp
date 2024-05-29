'use client'

import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { Amplify } from 'aws-amplify';
import { signOut } from 'aws-amplify/auth';
import awsconfig from '../src/aws-exports';

Amplify.configure(awsconfig);

function Home() {
  return (
    <div>
      <button onClick={() => signOut()}>Sign out</button>
    </div>
  );
}

export default withAuthenticator(Home);