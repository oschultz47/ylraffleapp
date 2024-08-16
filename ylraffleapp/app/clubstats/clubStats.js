import React, { useState, useEffect } from 'react';
import { get } from 'aws-amplify/api';
import { useAuth } from '../context/AuthContext';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import {
  Chart as ChartJS,
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  CategoryScale
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { useRouter } from 'next/navigation';
import LoadingScreen from '../LoadingScreen';
import './clubStats.css';

ChartJS.register(
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  CategoryScale
);

const ClubStats = () => {
  const [clubData, setClubData] = useState([]);
  const [leaderData, setLeaderData] = useState([]);
  const [leader, setLeader] = useState(null);
  const [school, setSchool] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('empty');
  const { auth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth) return;

    const fetchLeaders = async () => {
      try {
        const restOperation = get({
          apiName: 'ylraffle',
          path: '/leaders',
          httpMethod: 'GET',
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
        setLeaderData(result);
      } catch (error) {
        console.error('Error fetching leaders:', error);
      }
    };

    fetchLeaders();
  }, [auth]);

  useEffect(() => {
    if (!auth || leaderData.length === 0) return;

    const searchLeader = () => {
      const leader = leaderData.find(
        (element) => element.Email === auth.signInDetails.loginId
      );
      if (leader) {
        setLeader(true);
        setSchool(leader.School);
        if (school !== 'Admin') {
          setSelectedSchool(school); // Automatically set the school for non-admin users
        }
      } else {
        setLeader(false);
      }
    };

    searchLeader();
  }, [leaderData, auth]);

  useEffect(() => {
    if (!auth) return;
    if (!school) return;

    const fetchAndFilterClubs = async () => {
      try {
        const restOperation = get({
          apiName: 'ylraffle',
          path: '/clubs',
          httpMethod: 'GET',
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

        // Filter the data before setting the state
        let filteredData = result;
        if (school !== "Admin"){
          filteredData = result.filter(item => item.School === school);
        }

        if (filteredData.length === 0) {
          filteredData = [{
              Date: "N/A",
              School: school,
              NumStudents: 0
          }];
        }

        console.log(filteredData.length);
      
        
        setClubData(filteredData);
      } catch (error) {
        console.error('Error fetching clubs:', error);
      }
    };

    fetchAndFilterClubs();
  }, [auth, school]);

  const handleSchoolChange = (event) => {
    setSelectedSchool(event.target.value);
  };

  const filteredClubData = selectedSchool && selectedSchool !== ""
  ? clubData.filter(item => item.School === selectedSchool)
  : clubData;


  // Parse the date string as a local date
  const parseDateAsLocal = (dateString) => {
    const parts = dateString.split('-');
    return new Date(parts[0], parts[1] - 1, parts[2]);
  };

  // Get unique school names
  const schoolOptions = Array.from(new Set(clubData.map(item => item.School)));

  // Create datasets for each school if no specific school is selected
  const datasets = selectedSchool && selectedSchool !== ""
  ? [
      {
        label: selectedSchool,
        data: clubData
          .filter(item => item.School === selectedSchool)
          .map(item => ({
            x: parseDateAsLocal(item.Date),
            y: item.NumStudents,
          })),
        fill: false,
        backgroundColor: 'rgb(75, 192, 192)',
        borderColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1,
      },
    ]
  : schoolOptions.map((schoolName, index) => {
      const schoolColor = `hsl(${index * 360 / schoolOptions.length}, 70%, 50%)`;
      const schoolData = clubData.filter(item => item.School === schoolName);

      return {
        label: schoolName,
        data: schoolData.map(item => ({
          x: parseDateAsLocal(item.Date),
          y: item.NumStudents,
        })),
        fill: false,
        backgroundColor: schoolColor,
        borderColor: schoolColor,
        tension: 0.1,
      };
    });

const data = {
  labels: clubData
    .filter(item => selectedSchool === "" || item.School === selectedSchool)
    .map(item => parseDateAsLocal(item.Date)),
  datasets: datasets,
};


  const options = {
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day',
          tooltipFormat: 'yyyy-MM-dd',
          displayFormats: {
            day: 'MMM d',
          },
        },
        ticks: {
          source: 'data',
          autoSkip: false,
        },
        title: {
          display: true,
          text: 'Date',
        },
      },
      y: {
        min: 1,
        ticks: {
          callback: function(value) {
            if (value === 1 || value % 5 === 0) {
              return value;
            }
            return null;
          },
        },
        title: {
          display: true,
          text: 'Number of Students',
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function(tooltipItem) {
            return `${tooltipItem.dataset.label}: ${tooltipItem.raw.y} students`;
          }
        }
      }
    }
  };

  if ( selectedSchool === 'empty' || clubData.length == 0) {
    return <LoadingScreen />;
  }

  if (clubData[0].NumStudents !== 0){
    return (
      <div className="club-statistics-container">
        <div className="header-container">
          <button className="club-home-button" onClick={() => router.push('/')}>Home</button>
          <h2>Club Statistics {school !== 'Admin' && `for ${school}`}</h2>
        </div>
        {school === 'Admin' && (
          <div className="school-filter">
            <label htmlFor="school-select">Filter by School: </label>
            <select
              id="school-select"
              value={selectedSchool}
              onChange={handleSchoolChange}
            >
              <option value="">All Schools</option>
              {schoolOptions.map(schoolName => (
                <option key={schoolName} value={schoolName}>
                  {schoolName}
                </option>
              ))}
            </select>
          </div>
        )}
            <div className="chart-container">
              <Line data={data} options={options} />
            </div>
            <div className="table-container">
              <table className="club-data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>School</th>
                    <th>Number of Students</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClubData.map((item, index) => (
                    <tr key={index}>
                      <td>{parseDateAsLocal(item.Date).toLocaleDateString()}</td>
                      <td>{item.School}</td>
                      <td>{item.NumStudents}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
      </div>
    );
  }

  else if (clubData[0].NumStudents === 0){
    return(
      <div className="club-statistics-container">
      <div className="header-container">
        <button className="club-home-button" onClick={() => router.push('/')}>Home</button>
        <h2>Club Statistics {school !== 'Admin' && `for ${school}`}</h2>
      </div>
      <div className="no-data-message">
      <p>No data available for this club</p>
     </div>
      </div>
    )
  }
};

export default ClubStats;
