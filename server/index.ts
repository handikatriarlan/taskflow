import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const prisma = new PrismaClient();
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
    
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword
      }
    });

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
    console.error('Registration error:', error);
    res.status(400).json({ error: 'Invalid input data' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    
    const user = await prisma.user.findUnique({
      where: { email }
    });

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
    const lists = await prisma.list.findMany({
      where: {
        userId: req.userId
      },
      include: {
        tasks: {
          orderBy: {
            order: 'asc'
          }
        }
      },
      orderBy: {
        order: 'asc'
      }
    });

    res.json(lists);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch lists' });
  }
});

app.post('/api/lists', authenticateToken, async (req: any, res) => {
  try {
    const { title, order } = listSchema.parse(req.body);
    const list = await prisma.list.create({
      data: {
        title,
        order,
        userId: req.userId
      },
      include: {
        tasks: true
      }
    });
    
    res.json(list);
  } catch (error) {
    res.status(400).json({ error: 'Invalid input data' });
  }
});

app.delete('/api/lists/:id', authenticateToken, async (req: any, res) => {
  try {
    const list = await prisma.list.deleteMany({
      where: {
        id: req.params.id,
        userId: req.userId
      }
    });

    if (!list.count) {
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
    
    const list = await prisma.list.findFirst({
      where: {
        id: req.params.listId,
        userId: req.userId
      }
    });

    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        order,
        listId: req.params.listId
      }
    });

    res.json(task);
  } catch (error) {
    res.status(400).json({ error: 'Invalid input data' });
  }
});

app.patch('/api/tasks/:id', authenticateToken, async (req: any, res) => {
  try {
    const task = await prisma.task.findFirst({
      where: {
        id: req.params.id,
        list: {
          userId: req.userId
        }
      }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const updatedTask = await prisma.task.update({
      where: {
        id: req.params.id
      },
      data: req.body
    });

    res.json(updatedTask);
  } catch (error) {
    res.status(400).json({ error: 'Invalid input data' });
  }
});

app.delete('/api/tasks/:id', authenticateToken, async (req: any, res) => {
  try {
    const task = await prisma.task.deleteMany({
      where: {
        id: req.params.id,
        list: {
          userId: req.userId
        }
      }
    });

    if (!task.count) {
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