import React, { useState, useEffect } from 'react';
import { get } from 'aws-amplify/api';
import { useAuth } from '../context/AuthContext';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto'; // Import this to automatically register the chart components
import {
  Chart as ChartJS,
  TimeScale, // Import the TimeScale
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import 'chartjs-adapter-date-fns'; // Import the date adapter you prefer

// Register the components you need
ChartJS.register(
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);
import LoadingScreen from '../LoadingScreen';
import './clubStats.css';

const ClubStats = () => {
  const [clubData, setClubData] = useState([]);
  const [leader, setLeader] = useState(null);
  const [school, setSchool] = useState('');
  const { auth } = useAuth();

  useEffect(() => {
    const fetchAllClubs = async () => {
      try {
        const restOperation = get({
          apiName: 'ylraffle',
          path: '/allnames',
          httpMethod: 'GET'
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
        setClubData(result);
      } catch (error) {
        console.error('Error fetching club data:', error);
      }
    };

    if (auth && auth.signInDetails && auth.signInDetails.loginId) {
      fetchAllClubs();
    }
  }, [auth]);

  useEffect(() => {
    if (auth && auth.signInDetails && auth.signInDetails.loginId) {
      const leader = clubData.find(element => element.Email === auth.signInDetails.loginId);
      if (leader) {
        setLeader(true);
        setSchool(leader.School);
      } else {
        setLeader(false);
      }
    }
  }, [clubData, auth]);

  useEffect(() => {
    if (school) {
      const fetchClubData = async () => {
        try {
          const restOperation = get({
            apiName: 'ylraffle',
            path: `/clubs?school=${school}`,
            httpMethod: 'GET'
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
          setClubData(result);
        } catch (error) {
          console.error('Error fetching club data:', error);
        }
      };

      fetchClubData();
    }
  }, [school]);

  const data = {
    labels: clubData.map(item => new Date(item.Date).toLocaleDateString()),
    datasets: [
      {
        label: 'Number of Students',
        data: clubData.map(item => item.NumStudents),
        fill: false,
        backgroundColor: 'rgb(75, 192, 192)',
        borderColor: 'rgba(75, 192, 192, 0.2)',
      },
    ],
  };

  const options = {
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day',
        },
      },
    },
  };

  if (!leader) {
    return <LoadingScreen />;
  }

  return (
    <div className="club-statistics-container">
      <h2>Club Statistics for {school}</h2>
      <Line data={data} options={options} />
    </div>
  );
};

export default ClubStats;
