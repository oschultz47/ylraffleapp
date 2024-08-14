"use client"

import ClubStats from './clubStats';
import { Amplify } from 'aws-amplify';
import awsconfig from '../../src/aws-exports';

Amplify.configure(awsconfig);

const ClubStatsPage = () => {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      <ClubStats />
    </div>
  );
};

export default ClubStatsPage;