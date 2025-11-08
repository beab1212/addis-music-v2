import dotenv from 'dotenv';
import type { CorsOptions } from 'cors';

dotenv.config();

interface Config {
    betterAuth: {
        betterAuthSecret: string;
        betterAuthUrl: string;

        googleClientId: string;
        googleClientSecret: string;
    }
    
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
        databaseUrl: string;
    };

    redis: {
        host: string;
        port: number;
        username: string;
        password: string;
        db: number;
    };

    corsOptions: CorsOptions;
}

const config: Config = {
    betterAuth: {
        betterAuthSecret: process.env.BETTER_AUTH_SECRET || 'your_secret_key_here',
        betterAuthUrl: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
        googleClientId: process.env.GOOGLE_CLIENT_ID || '',
        googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    },


    gmailUser: process.env.GMAIL_USER || '',
    gmailPass: process.env.GMAIL_PASS || '',


    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
    jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret',

    database: {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 27017,
        username: process.env.DB_USERNAME || 'addismusic',
        password: process.env.DB_PASSWORD || '@Addis@Music',
        dbName: process.env.DB_NAME || 'addisdb',
        databaseUrl: process.env.DATABASE_URL || '',
    },

    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379,
        username: process.env.REDIS_USERNAME || '',
        password: process.env.REDIS_PASSWORD || '',
        db: process.env.REDIS_DB ? parseInt(process.env.REDIS_DB) : 0
    },

    corsOptions: {
        origin: 'http://localhost:3000',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true, // Allow sending cookies and HTTP authentication credentials
        optionsSuccessStatus: 204 // Some legacy browsers (IE11, various SmartTVs) choke on 200
    }
};

export default config;

