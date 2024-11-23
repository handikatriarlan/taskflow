import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

dotenv.config()

// Initialize Prisma with error handling
const prisma = new PrismaClient()

// Handle Prisma initialization
async function initializePrisma() {
	try {
		await prisma.$connect()
		console.log('Successfully connected to database')
	} catch (error) {
		console.error('Failed to connect to database:', error)
		process.exit(1)
	}
}

const app = express()

app.use(cors())
app.use(express.json())

const userSchema = z.object({
	name: z.string().min(2),
	email: z.string().email(),
	password: z.string().min(6),
})

const loginSchema = z.object({
	email: z.string().email(),
	password: z.string(),
})

// Authentication middleware
const authenticateToken = (req: any, res: any, next: any) => {
	const authHeader = req.headers['authorization']
	const token = authHeader && authHeader.split(' ')[1]

	if (!token) {
		return res.status(401).json({ error: 'No token provided' })
	}

	jwt.verify(token, process.env.JWT_SECRET!, (err: any, decoded: any) => {
		if (err) {
			return res.status(403).json({ error: 'Invalid token' })
		}
		req.userId = decoded.userId
		next()
	})
}

// Routes
app.post('/api/auth/register', async (req, res) => {
	try {
		const { name, email, password } = userSchema.parse(req.body)

		const existingUser = await prisma.user.findUnique({ where: { email } })
		if (existingUser) {
			return res.status(400).json({ error: 'Email already exists' })
		}

		const hashedPassword = await bcrypt.hash(password, 10)
		const user = await prisma.user.create({
			data: {
				name,
				email,
				password: hashedPassword,
			},
		})

		const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
			expiresIn: '7d',
		})

		res.json({
			token,
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
			},
		})
	} catch (error) {
		console.error('Registration error:', error)
		res.status(400).json({ error: 'Invalid input data' })
	}
})

app.post('/api/auth/login', async (req, res) => {
	try {
		const { email, password } = loginSchema.parse(req.body)

		const user = await prisma.user.findUnique({ where: { email } })
		if (!user) {
			return res.status(401).json({ error: 'Invalid credentials' })
		}

		const validPassword = await bcrypt.compare(password, user.password)
		if (!validPassword) {
			return res.status(401).json({ error: 'Invalid credentials' })
		}

		const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
			expiresIn: '7d',
		})

		res.json({
			token,
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
			},
		})
	} catch (error) {
		console.error('Login error:', error)
		res.status(400).json({ error: 'Invalid input data' })
	}
})

app.get('/api/auth/me', authenticateToken, async (req: any, res) => {
	try {
		const user = await prisma.user.findUnique({
			where: { id: req.userId },
		})

		if (!user) {
			return res.status(404).json({ error: 'User not found' })
		}

		res.json({
			id: user.id,
			name: user.name,
			email: user.email,
		})
	} catch (error) {
		console.error('Get user error:', error)
		res.status(500).json({ error: 'Server error' })
	}
})

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
	console.error(err.stack)
	res.status(500).json({ error: 'Something broke!' })
})

// Graceful shutdown
process.on('SIGTERM', async () => {
	console.log('SIGTERM received. Closing HTTP server and Prisma client...')
	await prisma.$disconnect()
	process.exit(0)
})

const PORT = process.env.PORT || 5000

// Start server with database connection
async function startServer() {
	await initializePrisma()
	app.listen(PORT, () => {
		console.log(`Server running on port ${PORT}`)
	})
}

startServer().catch((error) => {
	console.error('Failed to start server:', error)
	process.exit(1)
})
