import React from "react";
import { useEffect, useState } from 'react';
import api from '../api';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function AnalyticsPage(){
  const [summary, setSummary] = useState([]);
  const [topCategory, setTopCategory] = useState({});
  const [monthlyTotal, setMonthlyTotal] = useState(0);

  const year = new Date().getFullYear();
  const month = new Date().getMonth() + 1;

  useEffect(() => {
    (async () => {
      const sumRes = await api.get(`/me/summary/${year}/${month}`);
      setSummary(sumRes.data);
      const topRes = await api.get(`/me/top-category/${year}/${month}`);
      setTopCategory(topRes.data || {});
      const totalRes = await api.get(`/me/total/${year}/${month}`);
      setMonthlyTotal(totalRes.data.total || 0);
    })();
  }, []);

const pastelColors = [
  '#AEC6CF', '#FFB347', '#77DD77', '#F49AC2', '#CFCFC4', '#FFD1DC', '#B39EB5',
  '#FF6961', '#CB99C9', '#FDFD96'
];

const barData = {
  labels: summary.map(s => s.category),
  datasets: [{
    label: 'Amount Spent',
    data: summary.map(s => s.total),
    backgroundColor: summary.map((_, i) => pastelColors[i % pastelColors.length]),
    borderRadius: 6
  }]
};


  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-2xl font-bold mb-2">Your Analytics</h1>
        <p className="text-slate-300">{new Date(year, month-1).toLocaleString('default', { month: 'long', year:'numeric' })}</p>
        <div className="mt-4 grid lg:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 p-6 text-white">
            <div className="text-sm uppercase">Total This Month</div>
            <div className="text-4xl font-bold">₹{Number(monthlyTotal).toLocaleString()}</div>
          </div>
          <div className="lg:col-span-2 card">
            <Bar data={barData} />
          </div>
        </div>
        <div className="mt-4 text-lg">Most Spent Category: <b>{topCategory?.category ?? '-'}</b> (₹{Number(topCategory?.total || 0).toLocaleString()})</div>
      </div>
    </div>
  );
}