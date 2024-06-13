"use client"

import Directory from './directory';
import { Amplify } from 'aws-amplify';
import awsconfig from '../../src/aws-exports';

Amplify.configure(awsconfig);

const DirectoryPage = () => {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      <Directory />
    </div>
  );
};

export default DirectoryPage;