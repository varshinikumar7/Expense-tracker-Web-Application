import React from "react";
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { motion } from 'framer-motion';

export default function Register(){
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault(); setError('');
    try {
      const { data } = await api.post('/auth/register', { username, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.user.username);
      navigate('/');
    } catch (e) {
      setError(e?.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="grid place-items-center min-h-[80vh]">
      <motion.form onSubmit={submit} className="card w-full max-w-md space-y-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y:0 }}>
        <h1 className="text-2xl font-bold">Create your family account ✨</h1>
        {error && <div className="text-red-400">{error}</div>}
        <input className="input" placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} />
        <input className="input" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="btn btn-primary w-full">Register</button>
        <p className="text-sm text-slate-800">Already have an account? <Link className="underline" to="/login">Login</Link></p>
      </motion.form>
    </div>
  );
}