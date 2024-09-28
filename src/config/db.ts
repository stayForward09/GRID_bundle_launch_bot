import dotenv from 'dotenv'
dotenv.config()

import mongoose from 'mongoose'
export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.mongoURI)
        console.log('MongoDB Connected...')
    } catch (err) {
        console.error('db error', err.message)
        // Exit process with failure
        process.exit(1)
    }
}
