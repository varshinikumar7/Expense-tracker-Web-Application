require('dotenv').config();
const path = require('path');
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// MySQL pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}).promise();

/* ---------- API endpoints ---------- */

// 1) All expenses (recent first)
app.get('/api/expenses', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT e.expense_id, u.username, c.category_name, e.amount, e.expense_date, e.notes
       FROM Expenses e
       JOIN Users u ON e.user_id = u.user_id
       JOIN Categories c ON e.category_id = c.category_id
       ORDER BY e.expense_date DESC
       LIMIT 100`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 2) Last N expenses for a user
app.get('/api/users/:id/expenses', async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const limit = parseInt(req.query.limit, 10) || 5;
  try {
    const [rows] = await pool.query(
      `SELECT e.expense_id, c.category_name, e.amount, e.expense_date, e.notes
       FROM Expenses e
       JOIN Categories c ON e.category_id = c.category_id
       WHERE e.user_id = ?
       ORDER BY e.expense_date DESC
       LIMIT ?`, [userId, limit]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 3) Monthly totals (all users combined)
app.get('/api/monthly-totals', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT DATE_FORMAT(expense_date, '%Y-%m') AS month, SUM(amount) AS total_spent
       FROM Expenses
       GROUP BY month
       ORDER BY month;`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 4) Total per user per month
app.get('/api/user-monthly', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.username, DATE_FORMAT(e.expense_date, '%Y-%m') AS month, SUM(e.amount) AS total_spent
       FROM Expenses e
       JOIN Users u ON e.user_id = u.user_id
       GROUP BY u.username, month
       ORDER BY month, total_spent DESC;`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 5) Top spender each month (MySQL 8+)
app.get('/api/top-spender-month', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT month, username, total_spent FROM (
         SELECT DATE_FORMAT(e.expense_date,'%Y-%m') AS month, u.username,
                SUM(e.amount) AS total_spent,
                ROW_NUMBER() OVER (PARTITION BY DATE_FORMAT(e.expense_date,'%Y-%m') ORDER BY SUM(e.amount) DESC) rn
         FROM Expenses e
         JOIN Users u ON e.user_id = u.user_id
         GROUP BY month, u.username
       ) t WHERE rn = 1 ORDER BY month;`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 6) Top category overall
app.get('/api/top-category', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.category_name, SUM(e.amount) AS total_spent
       FROM Expenses e
       JOIN Categories c ON e.category_id = c.category_id
       GROUP BY c.category_name
       ORDER BY total_spent DESC
       LIMIT 1;`
    );
    res.json(rows[0] || {});
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 7) Top category per user
app.get('/api/top-category-per-user', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT username, category_name, total_spent FROM (
         SELECT u.username, c.category_name, SUM(e.amount) AS total_spent,
                ROW_NUMBER() OVER (PARTITION BY e.user_id ORDER BY SUM(e.amount) DESC) rn
         FROM Expenses e
         JOIN Users u ON e.user_id = u.user_id
         JOIN Categories c ON e.category_id = c.category_id
         GROUP BY e.user_id, c.category_id
       ) t WHERE rn = 1 ORDER BY username;`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 8) Category-wise percentage
app.get('/api/category-percentages', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.category_name,
              ROUND(SUM(e.amount) / (SELECT SUM(amount) FROM Expenses) * 100, 2) AS percentage
       FROM Expenses e
       JOIN Categories c ON e.category_id = c.category_id
       GROUP BY c.category_name
       ORDER BY percentage DESC;`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT user_id, username FROM Users ORDER BY username`);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
// Get all categories
app.get('/api/categories', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT category_id, category_name FROM Categories ORDER BY category_name`);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
// Add a new expense
app.post('/api/expenses', async (req, res) => {
  const { userId, categoryId, amount, description, date } = req.body;
  
  if (!userId || !categoryId || !amount || !date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO Expenses (user_id, category_id, amount, expense_date,notes)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, categoryId, amount, date, description || null]
    );
    res.json({ success: true, expenseId: result.insertId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});


/* ---------- Serve React in production ---------- */
if (process.env.NODE_ENV === 'production') {
  const __dirnameRoot = path.resolve();
  app.use(express.static(path.join(__dirnameRoot, 'client', 'build')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirnameRoot, 'client', 'build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Backend running on http://localhost:${PORT}`));
