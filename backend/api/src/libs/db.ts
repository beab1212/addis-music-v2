import { PrismaClient } from '@prisma/client'

let prisma = new PrismaClient()

const verifyDatabaseConnection = async () => {
  try {
    await prisma.$connect();
        console.log('Database connection established');
    } catch (error) {
        console.error('Database connection failed:', error);
    }
}

verifyDatabaseConnection();

export default prisma