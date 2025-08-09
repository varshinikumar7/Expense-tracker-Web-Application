import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function ExpenseTable() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    let mounted = true; // prevents setting state after unmount

    axios.get('/api/expenses')
      .then(r => {
        if (mounted) setRows(r.data);
      })
      .catch(err => console.error('Error fetching expenses:', err));

    return () => { mounted = false; }; // cleanup
  }, []);

  return (
    <div>
      <h3>Recent Expenses</h3>
      <table border="1" style={{ width: '100%', textAlign: 'left' }}>
        <thead>
          <tr>
            <th>User</th>
            <th>Category</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.expense_id}>
              <td>{r.username}</td>
              <td>{r.category_name}</td>
              <td>{r.amount}</td>
              <td>{r.expense_date}</td>
              <td>{r.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
