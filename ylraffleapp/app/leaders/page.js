"use client"

import Leaders from './leaders';
import { Amplify } from 'aws-amplify';
import awsconfig from '../../src/aws-exports';

Amplify.configure(awsconfig);

const LeadersPage = () => {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      <Leaders />
    </div>
  );
};

export default LeadersPage;