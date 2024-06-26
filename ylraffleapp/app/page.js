'use client'

import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { Amplify } from 'aws-amplify';
import awsconfig from '../src/aws-exports';
import { getCurrentUser } from 'aws-amplify/auth';
import { get } from 'aws-amplify/api';
import * as React from 'react';
import ButtonAppBar from './appBar';
import { useAuth } from './context/AuthContext';
import './home.css'; // Import your stylesheet

Amplify.configure(awsconfig);

function Home() {
  
  const [tableData, setTableData] = React.useState([]);
  const [leader, setLeader] = React.useState(false);

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

  React.useEffect(() => {
    const fetchItems = async () => {
      try {
        const restOperation = get({
          apiName: 'ylraffleapi',
          path: '/raffle'
        });
        const response = await restOperation.response;
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let result = '';
        let done = false;

        while (!done) {
          const { value, done: streamDone } = await reader.read();
          done = streamDone;
          result += decoder.decode(value, { stream: !done });
        }
        result = JSON.parse(result);
        for (let i = 0; i < result.length; i++) {
          result[i].Timestamp = new Date(result[i].Timestamp).toLocaleString();
        }
        setTableData(result);
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    };
    fetchItems();
  }, []);
  
  React.useEffect(() => {
    setLeader(false);
    tableData.forEach(element => {
      if (!(auth.signInDetails.loginId == null) && auth.signInDetails.loginId === element.Email) {
        setLeader(true);
      }
    });
  }, [tableData, auth])
  
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
