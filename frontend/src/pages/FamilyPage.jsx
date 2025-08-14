import React from "react";
import { useEffect, useState } from 'react';
import api from '../api';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
ChartJS.register(ArcElement, Tooltip, Legend);

export default function FamilyPage(){
  const [total, setTotal] = useState(0);
  const [byUser, setByUser] = useState([]);
  const year = new Date().getFullYear();
  const month = new Date().getMonth() + 1;

  useEffect(()=>{
    (async()=>{
      const t = await api.get(`/family/total/${year}/${month}`);
      setTotal(t.data.total || 0);
      const b = await api.get(`/family/by-user/${year}/${month}`);
      setByUser(b.data || []);
    })();
  },[]);

const pastelColors = [
  '#AEC6CF', '#FFB347', '#77DD77', '#F49AC2', '#CFCFC4', '#FFD1DC', '#B39EB5',
  '#FF6961', '#CB99C9', '#FDFD96'
];

const pieData = {
  labels: byUser.map(u => u.username),
  datasets: [{
    data: byUser.map(u => u.total),
    backgroundColor: byUser.map((_, i) => pastelColors[i % pastelColors.length]),
    borderColor: '#ffffff',
    borderWidth: 2
  }]
};


  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-2xl font-bold mb-2">Family Overview</h1>
        <p className="text-slate-500">{new Date(year, month-1).toLocaleString('default', { month: 'long', year:'numeric' })}</p>
        <div className="mt-4 grid lg:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-gradient-to-br from-fuchsia-500 to-pink-600 p-6 text-white">
            <div className="text-sm uppercase">Family Total</div>
            <div className="text-4xl font-bold">₹{Number(total).toLocaleString()}</div>
          </div>
          <div className="lg:col-span-2 card">
            <Pie data={pieData} />
          </div>
        </div>
        <div className="mt-6">
          <h2 className="font-semibold mb-2">Breakdown</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {byUser.map(u=> (
              <div key={u.username} className="rounded-xl bg-white/5 p-4">
                <div className="text-slate-500">{u.username}</div>
                <div className="text-2xl font-bold">₹{Number(u.total).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}