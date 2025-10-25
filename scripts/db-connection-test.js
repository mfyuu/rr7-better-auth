#!/usr/bin/env node

import pkg from "pg";
import dotenv from "dotenv";
import { exec } from "child_process";
import { promisify } from "util";

const { Pool } = pkg;
const execAsync = promisify(exec);

dotenv.config();

console.log("🔧 データベース接続テスト開始...");

async function getDsqlAuthToken() {
	const { stdout } = await execAsync(
		`AWS_PROFILE=poc-ops aws dsql generate-db-connect-admin-auth-token --hostname ${process.env.DSQL_ENDPOINT} --region ${process.env.AWS_REGION || "us-east-1"}`
	);
	return stdout.trim();
}

async function testDatabaseConnection() {
	try {
		console.log("🔌 DSQLクラスターに接続中...");

		const authToken = await getDsqlAuthToken();
		console.log("✅ 認証トークン取得成功！");

		const pool = new Pool({
			host: process.env.DSQL_ENDPOINT,
			port: parseInt(process.env.DSQL_PORT || "5432"),
			database: process.env.DSQL_DATABASE || "postgres",
			user: "admin",
			password: authToken,
			ssl: { rejectUnauthorized: false },
		});

		const client = await pool.connect();
		console.log("✅ データベース接続成功！");

		console.log("📊 データベース情報を取得中...");
		const result = await client.query('SELECT version()');
		console.log("📋 PostgreSQL バージョン:", result.rows[0].version);

		console.log("📋 既存のテーブルを確認中...");
		const tables = await client.query(`
			SELECT table_name
			FROM information_schema.tables
			WHERE table_schema = 'public'
			AND table_name IN ('user', 'session', 'account', 'verification')
			ORDER BY table_name
		`);

		if (tables.rows.length > 0) {
			console.log("✅ BetterAuth用のテーブルが存在します:");
			tables.rows.forEach(row => {
				console.log(`  - ${row.table_name}`);
			});
		} else {
			console.log("⚠️  BetterAuth用のテーブルが見つかりません");
		}

		if (tables.rows.length > 0) {
			console.log("📋 テーブル構造を確認中...");
			for (const table of tables.rows) {
				const columns = await client.query(`
					SELECT column_name, data_type, is_nullable
					FROM information_schema.columns
					WHERE table_name = '${table.table_name}'
					ORDER BY ordinal_position
				`);
				console.log(`\n📊 ${table.table_name} テーブル:`);
				columns.rows.forEach(col => {
					console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
				});
			}
		}

		client.release();
		await pool.end();
		console.log("🎉 データベース接続テスト完了！");

		return true;

	} catch (error) {
		console.error("❌ データベース接続エラー:", error.message);
		console.error("🔍 エラー詳細:", error);
		return false;
	}
}

async function generateDatabaseUrl() {
	try {
		console.log("🔧 DATABASE_URLを生成中...");

		const authToken = await getDsqlAuthToken();
		const databaseUrl = `postgresql://admin:${authToken}@${process.env.DSQL_ENDPOINT}:${process.env.DSQL_PORT}/${process.env.DSQL_DATABASE}?sslmode=require`;

		console.log("✅ DATABASE_URLが生成されました");
		console.log(`   URL: postgresql://admin:***@${process.env.DSQL_ENDPOINT}:${process.env.DSQL_PORT}/${process.env.DSQL_DATABASE}?sslmode=require`);

		return databaseUrl;

	} catch (error) {
		console.error("❌ DATABASE_URL生成エラー:", error.message);
		return null;
	}
}

async function main() {
	console.log("🚀 BetterAuth用データベース接続テスト開始...");

	const connectionSuccess = await testDatabaseConnection();

	if (!connectionSuccess) {
		console.error("❌ データベース接続に失敗しました");
		process.exit(1);
	}

	const databaseUrl = await generateDatabaseUrl();

	if (!databaseUrl) {
		console.error("❌ DATABASE_URL生成に失敗しました");
		process.exit(1);
	}

	console.log("✅ すべてのテストが成功しました！");
	console.log("🎯 BetterAuthの初期化準備が完了しました");
}

main().catch(console.error);
