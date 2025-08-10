const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// DB connection
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'Var@7-shini',
    database: process.env.DB_NAME || 'expense_tracker'
});

db.connect(err => {
    if (err) throw err;
    console.log('MySQL Connected...');
});

// Add Expense
app.post('/expenses', (req, res) => {
    const { category, amount, date } = req.body;
    db.query(
        "INSERT INTO expenses (category, amount, date) VALUES (?, ?, ?)",
        [category, amount, date],
        (err, result) => {
            if (err) return res.status(500).send(err);
            res.send({ message: 'Expense added successfully' });
        }
    );
});

// Get Monthly Summary
app.get('/summary/:year/:month', (req, res) => {
    const { year, month } = req.params;
    db.query(
        `SELECT category, SUM(amount) as total 
         FROM expenses 
         WHERE YEAR(date) = ? AND MONTH(date) = ? 
         GROUP BY category`,
        [year, month],
        (err, rows) => {
            if (err) return res.status(500).send(err);
            res.send(rows);
        }
    );
});

// Total of the Month
app.get('/total/:year/:month', (req, res) => {
    const { year, month } = req.params;
    db.query(
        `SELECT SUM(amount) as total 
         FROM expenses 
         WHERE YEAR(date) = ? AND MONTH(date) = ?`,
        [year, month],
        (err, rows) => {
            if (err) return res.status(500).send(err);
            res.send(rows[0]);
        }
    );
});

// Most Spent Category
app.get('/top-category/:year/:month', (req, res) => {
    const { year, month } = req.params;
    db.query(
        `SELECT category, SUM(amount) as total 
         FROM expenses 
         WHERE YEAR(date) = ? AND MONTH(date) = ?
         GROUP BY category
         ORDER BY total DESC LIMIT 1`,
        [year, month],
        (err, rows) => {
            if (err) return res.status(500).send(err);
            res.send(rows[0]);
        }
    );
});
// Example: Get Monthly Total
app.get("/monthly-total/:year/:month", (req, res) => {
  const { year, month } = req.params;
  const query = `
    SELECT SUM(amount) AS total
    FROM expenses
    WHERE YEAR(date) = ? AND MONTH(date) = ?;
  `;
  db.query(query, [year, month], (err, results) => {
    if (err) throw err;
    res.json({ total: results[0].total || 0 });
  });
});

app.listen(5000, () => console.log('Server running on port 5000'));
