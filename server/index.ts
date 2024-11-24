import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import pkg from 'pg'
const { Pool } = pkg

dotenv.config();

// Initialize PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const app = express();

app.use(cors());
app.use(express.json());

// Schemas
const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

const listSchema = z.object({
  title: z.string().min(1),
  order: z.number().int()
});

const taskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  order: z.number().int()
});

// Middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.userId = decoded.userId;
    next();
  });
};

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = userSchema.parse(req.body);
    
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, hashedPassword]
    );

    const user = result.rows[0];
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.json({ token, user });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ error: 'Invalid input data' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(400).json({ error: 'Invalid input data' });
  }
});

// Lists Routes
app.get('/api/lists', authenticateToken, async (req: any, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM lists WHERE user_id = $1 ORDER BY "order"',
      [req.userId]
    );
    
    const lists = await Promise.all(result.rows.map(async (list) => {
      const tasksResult = await pool.query(
        'SELECT * FROM tasks WHERE list_id = $1 ORDER BY "order"',
        [list.id]
      );
      return { ...list, tasks: tasksResult.rows };
    }));

    res.json(lists);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch lists' });
  }
});

app.post('/api/lists', authenticateToken, async (req: any, res) => {
  try {
    const { title, order } = listSchema.parse(req.body);
    const result = await pool.query(
      'INSERT INTO lists (title, "order", user_id) VALUES ($1, $2, $3) RETURNING *',
      [title, order, req.userId]
    );
    
    const list = { ...result.rows[0], tasks: [] };
    res.json(list);
  } catch (error) {
    res.status(400).json({ error: 'Invalid input data' });
  }
});

app.delete('/api/lists/:id', authenticateToken, async (req: any, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM lists WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'List not found' });
    }

    res.json({ message: 'List deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete list' });
  }
});

// Tasks Routes
app.post('/api/lists/:listId/tasks', authenticateToken, async (req: any, res) => {
  try {
    const { title, description, order } = taskSchema.parse(req.body);
    
    const listResult = await pool.query(
      'SELECT * FROM lists WHERE id = $1 AND user_id = $2',
      [req.params.listId, req.userId]
    );

    if (listResult.rows.length === 0) {
      return res.status(404).json({ error: 'List not found' });
    }

    const result = await pool.query(
      'INSERT INTO tasks (title, description, "order", list_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, description, order, req.params.listId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: 'Invalid input data' });
  }
});

app.patch('/api/tasks/:id', authenticateToken, async (req: any, res) => {
  try {
    const taskResult = await pool.query(
      'SELECT t.* FROM tasks t JOIN lists l ON t.list_id = l.id WHERE t.id = $1 AND l.user_id = $2',
      [req.params.id, req.userId]
    );

    if (taskResult.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const updates = Object.keys(req.body).map((key, i) => `"${key}" = $${i + 1}`).join(', ');
    const values = [...Object.values(req.body), req.params.id];
    
    const result = await pool.query(
      `UPDATE tasks SET ${updates} WHERE id = $${values.length} RETURNING *`,
      values
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: 'Invalid input data' });
  }
});

app.delete('/api/tasks/:id', authenticateToken, async (req: any, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM tasks t USING lists l WHERE t.id = $1 AND t.list_id = l.id AND l.user_id = $2 RETURNING t.*',
      [req.params.id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});