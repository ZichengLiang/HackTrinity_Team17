import { useState } from 'react';
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';  // Auto-import necessary chart features
import styles from './TopSites.module.css';

const TopSites = () => {
  const [topSites, setTopSites] = useState([]);
  const [loading, setLoading] = useState(false);  // Loading state

  // Fetch top websites from the backend
  const fetchTopSites = async () => {
    setLoading(true); // Set loading to true when fetching starts
    try {
      const response = await fetch('http://localhost:8000/top-websites');  // Make sure to adjust the backend URL
      if (response.ok) {
        const data = await response.json();
        console.log("Data fetched successfully:", data);
        setTopSites(data.top_websites);  // Update state with the fetched data
      } else {
        console.error('Failed to fetch top websites');
      }
    } catch (error) {
      console.error('Error fetching top websites:', error);
    } finally {
      setLoading(false);  // Set loading to false once the data is fetched
    }
  };

  // Prepare data for the pie chart
  const chartData = {
    labels: topSites.map(site => site.domain),
    datasets: [
      {
        label: 'Top Websites Using Images',
        data: topSites.map(site => site.count),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
      }
    ]
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Top Sites</h1>
      
      <button onClick={fetchTopSites} className={styles.fetchButton}>
        Fetch Top Sites
      </button>

      {loading ? (
        <p>Loading...</p>
      ) : topSites.length > 0 ? (
        <div className={styles.chartContainer}>
          <Pie data={chartData} />
        </div>
      ) : (
        <p>No sites found</p>
      )}
    </div>
  );
};

export default TopSites;
