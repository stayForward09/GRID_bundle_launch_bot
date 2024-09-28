import dotenv from 'dotenv'
import startBot from './bot'
import { connectDB } from './config/db'

connectDB()
startBot()
// add additional codebase here //@davy
