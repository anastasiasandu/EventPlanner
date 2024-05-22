const { PrismaClient } = require('@prisma/client')
const dotenv = require('dotenv')

// Load environment variables from .env file
dotenv.config()

const prisma = new PrismaClient()

async function connect() {
    try {
        console.log('Establishing connection')
        await prisma.$connect()
        console.log('Connection established')
    } catch (error) {
        console.error('Error connecting with the database', error)
    }
}

module.exports = { prisma, connect }
