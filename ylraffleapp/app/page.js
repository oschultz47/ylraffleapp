'use client'

import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { Amplify } from 'aws-amplify';
import awsconfig from '../src/aws-exports';
import { getCurrentUser } from 'aws-amplify/auth';
import { get } from 'aws-amplify/api';
import * as React from 'react';
import ButtonAppBar from './appBar';


Amplify.configure(awsconfig);

function Home() {
  
  const [user, setUser] = React.useState({});
  const [tableData, setTableData] = React.useState([]);


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
        console.log('Items:', result);
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    };
    fetchItems();
  }, []);

  React.useEffect(() => {
    console.log('Table Data:', tableData);
  }
  , [tableData]);
  


  if (!user.signInDetails) {
    return <div>Loading...</div>;
  }

  return (
      <ButtonAppBar />
  );
}

export default withAuthenticator(Home);