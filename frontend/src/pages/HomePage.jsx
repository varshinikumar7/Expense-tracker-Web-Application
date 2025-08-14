import React from "react";
import { useEffect, useState } from 'react';
import api from '../api.js';
import { motion } from 'framer-motion';
import Modal from '../widgets/Modal.jsx';

const CATEGORIES = ['Food','Transport','Entertainment','Bills','Groceries'];

export default function HomePage(){
  const [category, setCategory] = useState('Food');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0,10));
  const [note, setNote] = useState('');
  const [recent, setRecent] = useState([]);
  const [error, setError] = useState('');

  const [editing, setEditing] = useState(null);

  const year = new Date().getFullYear();
  const month = new Date().getMonth() + 1;

  const fetchRecent = async () => {
    const { data } = await api.get('/expenses?limit=10');
    setRecent(data);
  };

  const addExpense = async () => {
    try {
      await api.post('/expenses', { category, amount: Number(amount), date, note });
      setAmount(''); setNote('');
      await fetchRecent();
    } catch (e) {
      setError(e?.response?.data?.error || 'Failed to add');
    }
  };

  const saveEdit = async () => {
    try {
      await api.put(`/expenses/${editing.id}`, { category: editing.category, amount: Number(editing.amount), date: editing.date?.slice(0,10), note: editing.note });
      setEditing(null); fetchRecent();
    } catch (e) { setError('Failed to update'); }
  };

  const remove = async (id) => {
    if (!confirm('Delete this expense?')) return;
    try { await api.delete(`/expenses/${id}`); fetchRecent(); } catch { setError('Failed to delete'); }
  };

  useEffect(()=>{ fetchRecent(); },[]);

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y:0 }} className="card">
        <h1 className="text-2xl font-bold mb-4">Add Expense</h1>
        {error && <div className="text-red-400 mb-2">{error}</div>}
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <select className="select" value={category} onChange={e=>setCategory(e.target.value)}>
            {CATEGORIES.map(c=> <option key={c}>{c}</option>)}
          </select>
          <input className="input" type="number" min="0" step="0.01" placeholder="Amount" value={amount} onChange={e=>setAmount(e.target.value)} />
          <input className="input" type="date" value={date} onChange={e=>setDate(e.target.value)} />
          <input className="input" placeholder="Note (optional)" value={note} onChange={e=>setNote(e.target.value)} />
          <button className="btn btn-primary" onClick={addExpense}>Add</button>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y:0 }} className="card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">Recently Added</h2>
          <button onClick={fetchRecent} className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20">Refresh</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-slate-700">
              <tr>
                <th className="py-2">Date</th>
                <th>Category</th>
                <th>Note</th>
                <th className="text-right">Amount (₹)</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {recent.map(r => (
                <tr key={r.id} className="border-t border-white/10 hover:bg-white/5 transition">
                  <td className="py-2">{new Date(r.date).toLocaleDateString()}</td>
                  <td>{r.category}</td>
                  <td className="truncate max-w-[300px]">{r.note || '-'}</td>
                  <td className="text-right font-semibold">{Number(r.amount).toLocaleString()}</td>
                  <td className="text-right space-x-2">
                    <button onClick={()=>setEditing(r)} className="px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-700">Edit</button>
                    <button onClick={()=>remove(r.id)} className="px-3 py-1 rounded-xl bg-rose-600 hover:bg-rose-700">Delete</button>
                  </td>
                </tr>
              ))}
              {!recent.length && (
                <tr><td colSpan="5" className="py-6 text-center text-slate-800">No expenses yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {editing && (
        <Modal onClose={()=>setEditing(null)} title="Edit Expense">
          <div className="space-y-3">
            <select className="select" value={editing.category} onChange={e=>setEditing({...editing, category:e.target.value})}>
              {CATEGORIES.map(c=> <option key={c}>{c}</option>)}
            </select>
            <input className="input" type="number" value={editing.amount} onChange={e=>setEditing({...editing, amount:e.target.value})} />
            <input className="input" type="date" value={editing.date?.slice(0,10)} onChange={e=>setEditing({...editing, date:e.target.value})} />
            <input className="input" value={editing.note||''} onChange={e=>setEditing({...editing, note:e.target.value})} />
            <div className="flex gap-2 justify-end">
              <button className="px-4 py-2 rounded-xl bg-slate-600 hover:bg-slate-700" onClick={()=>setEditing(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveEdit}>Save</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}