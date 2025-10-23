import { betterAuth } from "better-auth";
import Database from "better-sqlite3";

export const auth = betterAuth({
	baseURL: process.env.BETTER_AUTH_URL || "http://localhost:5173",
	database: new Database("database.sqlite"),
	socialProviders: {
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID as string,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
		},
	},
});
