import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CategoryPieChart from './CategoryPieChart';

export default function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({ user: '', category: '', amount: '', description: '' });

  // Fetch latest expenses
  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = () => {
    axios.get('/api/expenses')
      .then(res => setExpenses(res.data))
      .catch(err => console.error(err));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('/api/expenses', form)
      .then(() => {
        setForm({ user: '', category: '', amount: '', description: '' });
        fetchExpenses();
      })
      .catch(err => console.error(err));
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">💰 Expense Tracker Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        
        {/* Add Expense Form */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">➕ Add Expense</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="User"
              value={form.user}
              onChange={e => setForm({ ...form, user: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="text"
              placeholder="Category"
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="number"
              placeholder="Amount"
              value={form.amount}
              onChange={e => setForm({ ...form, amount: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="text"
              placeholder="Description"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full p-2 border rounded"
            />
            <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
              Add Expense
            </button>
          </form>
        </div>

        {/* Pie Chart */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <CategoryPieChart />
        </div>
      </div>

      {/* Recent Expenses Table */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">📜 Recent Expenses</h2>
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">User</th>
              <th className="p-2 border">Category</th>
              <th className="p-2 border">Amount</th>
              <th className="p-2 border">Description</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((exp, i) => (
              <tr key={i} className="text-center border-t">
                <td className="p-2 border">{exp.user}</td>
                <td className="p-2 border">{exp.category}</td>
                <td className="p-2 border">₹{exp.amount}</td>
                <td className="p-2 border">{exp.description || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
