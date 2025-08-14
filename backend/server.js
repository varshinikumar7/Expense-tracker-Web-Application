import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';


dotenv.config({ path: './.gitignore/.env' });
console.log("Loaded JWT_SECRET:", process.env.JWT_SECRET);

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*', credentials: false }));

// MySQL pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || 'Var@7-shini',
  database: process.env.DB_NAME || 'expense_tracker',
  waitForConnections: true,
  connectionLimit: 10,
});

// Helpers
const signToken = (user) => jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '7d' });

const auth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'No token' });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, username }
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// --- Auth Routes ---
app.post('/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'username & password required' });

    const [exists] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
    if (exists.length) return res.status(409).json({ error: 'Username already taken' });

    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query('INSERT INTO users (username, password_hash) VALUES (?, ?)', [username, hash]);
    const user = { id: result.insertId, username };
    return res.json({ token: signToken(user), user });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' });

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    return res.json({ token: signToken(user), user: { id: user.id, username: user.username } });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
});

// --- Expense CRUD (per-user) ---
app.post('/expenses', auth, async (req, res) => {
  try {
    const { category, amount, date, note } = req.body;
    const [r] = await pool.query(
      'INSERT INTO expenses (user_id, category, amount, date, note) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, category, amount, date, note || null]
    );
    res.json({ id: r.insertId, message: 'Expense added' });
  } catch (e) {
    console.error(e); res.status(500).json({ error: 'Failed to add expense' });
  }
});

app.get('/expenses', auth, async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 10, 100);
    const [rows] = await pool.query(
      'SELECT * FROM expenses WHERE user_id = ? ORDER BY date DESC, id DESC LIMIT ?',
      [req.user.id, limit]
    );
    res.json(rows);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Failed to fetch' }); }
});

app.put('/expenses/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { category, amount, date, note } = req.body;
    const [r] = await pool.query(
      'UPDATE expenses SET category=?, amount=?, date=?, note=? WHERE id=? AND user_id=?',
      [category, amount, date, note || null, id, req.user.id]
    );
    if (!r.affectedRows) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Expense updated' });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Failed to update' }); }
});

app.delete('/expenses/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const [r] = await pool.query('DELETE FROM expenses WHERE id=? AND user_id=?', [id, req.user.id]);
    if (!r.affectedRows) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Expense deleted' });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Failed to delete' }); }
});

// --- Analytics: per-user ---
app.get('/me/summary/:year/:month', auth, async (req, res) => {
  try {
    const { year, month } = req.params;
    const [rows] = await pool.query(
      `SELECT category, SUM(amount) as total
       FROM expenses
       WHERE user_id = ? AND YEAR(date) = ? AND MONTH(date) = ?
       GROUP BY category
       ORDER BY category`,
      [req.user.id, year, month]
    );
    res.json(rows);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Failed' }); }
});

app.get('/me/total/:year/:month', auth, async (req, res) => {
  try {
    const { year, month } = req.params;
    const [rows] = await pool.query(
      'SELECT COALESCE(SUM(amount),0) as total FROM expenses WHERE user_id=? AND YEAR(date)=? AND MONTH(date)=?',
      [req.user.id, year, month]
    );
    res.json(rows[0]);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Failed' }); }
});

app.get('/me/top-category/:year/:month', auth, async (req, res) => {
  try {
    const { year, month } = req.params;
    const [rows] = await pool.query(
      `SELECT category, SUM(amount) as total
       FROM expenses
       WHERE user_id=? AND YEAR(date)=? AND MONTH(date)=?
       GROUP BY category
       ORDER BY total DESC
       LIMIT 1`,
      [req.user.id, year, month]
    );
    res.json(rows[0] || { category: null, total: 0 });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Failed' }); }
});

// --- Family Analytics (all users combined) ---
app.get('/family/total/:year/:month', auth, async (req, res) => {
  try {
    const { year, month } = req.params;
    const [rows] = await pool.query(
      'SELECT COALESCE(SUM(amount),0) as total FROM expenses WHERE YEAR(date)=? AND MONTH(date)=?',[year, month]
    );
    res.json(rows[0]);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Failed' }); }
});

app.get('/family/by-user/:year/:month', auth, async (req, res) => {
  try {
    const { year, month } = req.params;
    const [rows] = await pool.query(
      `SELECT u.username, COALESCE(SUM(e.amount),0) as total
       FROM users u
       LEFT JOIN expenses e ON e.user_id = u.id AND YEAR(e.date)=? AND MONTH(e.date)=?
       GROUP BY u.id
       ORDER BY total DESC`,
      [year, month]
    );
    res.json(rows);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Failed' }); }
});

app.get('/health', (_, res) => res.json({ ok: true }));

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`API running on :${port}`));