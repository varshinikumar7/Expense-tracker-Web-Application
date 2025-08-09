import React, {useEffect, useState} from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend
} from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function MonthlySpendingChart(){
  const [data, setData] = useState([]);
  useEffect(()=> {
    axios.get('/api/monthly-totals').then(res=> setData(res.data));
  },[]);
  const labels = data.map(r=> r.month);
  const values = data.map(r=> parseFloat(r.total_spent));
  const chartData = { labels, datasets: [{ label:'Monthly Total', data: values }]};
  return <div><h3>Monthly Spending</h3><Bar data={chartData} /></div>;
}
