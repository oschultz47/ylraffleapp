"use client"

import Raffle from '../raffle';
import { Amplify } from 'aws-amplify';
import awsconfig from '../../src/aws-exports';

Amplify.configure(awsconfig);

const RafflePage = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Raffle</h1>
      <Raffle />
    </div>
  );
};

export default RafflePage;