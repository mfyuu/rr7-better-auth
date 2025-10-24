import { betterAuth } from "better-auth";
import pkg from "pg";
const { Pool } = pkg;

/**
 * PostgreSQL接続プールの設定
 * 
 * @description
 * - 本番環境ではSSL接続を有効化
 * - 開発環境ではSSL接続を無効化
 * - 接続文字列は環境変数から取得、フォールバックは開発用設定
 */
const pool = new Pool({
	connectionString: process.env.DATABASE_URL || "postgresql://better_auth:better_auth_password@localhost:5432/better_auth",
	ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
});

/**
 * Better Auth設定
 * 
 * @description
 * PostgreSQLデータベースを使用した認証システムの設定
 * - データベース: PostgreSQL接続プール
 * - 認証プロバイダー: Google OAuth
 * - セッション管理: Better Auth標準機能
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
