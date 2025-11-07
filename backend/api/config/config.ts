import dotenv from 'dotenv';

dotenv.config();

interface Config {
    betterAuthSecret: string;
    betterAuthUrl: string;
    googleClientId: string;
    googleClientSecret: string;
    
    gmailUser: string;
    gmailPass: string;

    port: number;
    jwtSecret: string;

    database: {
        host: string;
        port: number;
        username: string;
        password: string;
        dbName: string;
    };

    redis: {
        host: string;
        port: number;
        password: string;
    };
}

const config: Config = {
    betterAuthSecret: process.env.BETTER_AUTH_SECRET || 'your_secret_key_here',
    betterAuthUrl: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',

    gmailUser: process.env.GMAIL_USER || '',
    gmailPass: process.env.GMAIL_PASS || '',


    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
    jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret',

    database: {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 27017,
        username: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD || '',
        dbName: process.env.DB_NAME || 'addis-music',
    },

    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379,
        password: process.env.REDIS_PASSWORD || '',
    },
};

export default config;

