import React from "react";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NavBar() {
  const loc = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <div className="sticky top-0 z-40 backdrop-blur bg-slate-900/60 border-b border-white/10">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/" className="font-bold text-xl">₹ Expense Tracker</Link>
        </motion.div>
        {token && (
          <nav className="ml-auto flex gap-4">
            {['/','/analytics','/family'].map((p, i) => (
              <Link key={p} to={p} className={`px-3 py-1 rounded-xl transition hover:bg-white/10 ${loc.pathname===p? 'bg-white/10' : ''}`}>{['Home','Analytics','Family'][i]}</Link>
            ))}
            <span className="px-3 py-1 rounded-xl bg-white/5">{username}</span>
            <button onClick={logout} className="btn btn-primary">Logout</button>
          </nav>
        )}
      </div>
    </div>
  );
}