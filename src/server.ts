import * as dotenv from 'dotenv'
dotenv.config()
import "express-async-errors"
import express, { NextFunction, Request, Response } from 'express'
import cors from 'cors'
import http from 'http'
import { Server } from 'socket.io'
import socket from './socket'
import mongoose from 'mongoose'

const app = express()

const serverHttp = http.createServer(app)

export const io = new Server(serverHttp, {
	cors: {
		// origin: process.env.URL,
		methods: ["GET", "POST"]
	}
})

socket(io)

app.use(cors())

app.use(express.json({ type: 'application/json', limit: '10MB' }))

app.use(express.urlencoded({ extended: true }))

async function connectDB() {
	try {
		await mongoose.connect(process.env.DATABASE_URL)
		console.log('Connect to MongoDB!')
	} catch (error: any) {
		throw new Error(error)
	}
}

connectDB()

app.use((error: Error, request: Request, response: Response, next: NextFunction) => {
	return response.status(400).json({
		status: "Error",
		message: error.message
	})
})

app.get('/', (req: Request, res: Response) => {
	return res.json({ 'Online': true, 'Server': 'UP' })
})

serverHttp.listen(process.env.PORT || 3334, () => console.log(`Server is running on PORT ${process.env.PORT} `))