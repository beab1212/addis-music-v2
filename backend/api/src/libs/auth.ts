import { betterAuth } from "better-auth";
import { z } from "zod";
// @ts-ignore
import Database from "better-sqlite3";
import config from "../config/config";
import { sendVerificationEmail } from "./email";
import { redisClient } from "./redis";


interface SecondaryStorage {
  get: (key: string) => Promise<unknown>; 
  set: (key: string, value: string, ttl?: number) => Promise<void>;
  delete: (key: string) => Promise<void>;
}

export const auth = betterAuth({
    database: new Database("./sqlite.db"),
    user: {
        additionalFields: {
            role: {
                type: "string",
                required: true,
                defaultValue: "user",
                validator: {
                    input: z.enum(["user", "admin"]),
                    output: z.enum(["user", "admin"]),
                },
                input: false, // don't allow user to set role
            },
            isArtist: {
                type: "boolean",
                required: true,
                defaultValue: false,
            },
        },
    },
    trustedOrigins: ["http://localhost:3000"],
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
    },
    emailVerification: {
        sendVerificationEmail: async ({ user, url, token }, request) => {
            const newUrl = url.replace("3000/api", "5000/api");
            await sendVerificationEmail(user.email, newUrl);
        },
    },
    socialProviders: {
        google: {
            prompt: "select_account",
            clientId: config.betterAuth.googleClientId,
            clientSecret: config.betterAuth.googleClientSecret,
            redirectURI: "http://localhost:5000/api/auth/callback/google",
        },
    },

    // Implementing session secondary storage using Redis(not working properly yet)
    secondaryStorage: {
		get: async (key) => {
            console.log("secondaryStorage get");
			return await redisClient.get(key);
		},
		set: async (key, value, ttl) => {
            console.log("secondaryStorage set");
			// TTL in seconds — convert ms with ttl * 1000.
			if (ttl) await redisClient.set(key, value, "EX", ttl );
			// or for ioredis:
			// if (ttl) await redis.set(key, value, 'EX', ttl)
			else await redisClient.set(key, value);
		},
		delete: async (key) => {
            console.log("secondaryStorage delete");
			await redisClient.del(key);
		}
	},
});


