import { betterAuth } from "better-auth";
import pkg from "pg";
import dotenv from "dotenv";

const { Pool } = pkg;

dotenv.config();

/**
 * PostgreSQL接続プール設定
 *
 * 環境変数から接続情報を取得し、本番環境ではSSL接続を有効化
 * 開発環境ではSSMポートフォワーディング経由でlocalhost:5432に接続
 */
const pool = new Pool({
	connectionString: process.env.DATABASE_URL || "postgresql://better_auth:better_auth_password@localhost:5432/better_auth",
	ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
});

/**
 * Better Auth設定
 *
 * Google OAuth認証とPostgreSQLデータベースを使用した認証システム
 * 環境変数から設定値を取得し、フォールバック値を提供
 */
export const auth = betterAuth({
	baseURL: process.env.BETTER_AUTH_URL || "http://localhost:5173",
	database: pool,
	secret: process.env.BETTER_AUTH_SECRET,
	socialProviders: {
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID as string,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
		},
	},
});
