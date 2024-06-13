"use client"

import Raffle from './raffle';
import { Amplify } from 'aws-amplify';
import awsconfig from '../../src/aws-exports';

Amplify.configure(awsconfig);

const RafflePage = () => {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      <Raffle />
    </div>
  );
};

export default RafflePage;