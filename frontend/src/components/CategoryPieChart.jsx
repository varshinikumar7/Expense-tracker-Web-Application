import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function CategoryPieChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8080/api/category-percentages') // or proxy path
      .then(r => setData(r.data))
      .catch(err => console.error("Error fetching category data", err));
  }, []);

  const labels = Array.isArray(data) ? data.map(d => d.category_name) : [];
  const values = Array.isArray(data) ? data.map(d => parseFloat(d.percentage)) : [];

  return (
    <div>
      <h3>Category %</h3>
      <Pie
        data={{
          labels,
          datasets: [{
            data: values,
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4CAF50', '#9966FF']
          }]
        }}
      />
    </div>
  );
}
