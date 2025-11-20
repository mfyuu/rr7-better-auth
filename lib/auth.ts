import { betterAuth } from "better-auth";
import { customSession } from "better-auth/plugins";
import "dotenv/config";

export const auth = betterAuth({
	// データベース構成がなければ自動的にステートレスモードが有効になる
	socialProviders: {
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID as string,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
		},
	},
	// データベースを指定しない場合、デフォルトで以下の構成が提供される
	session: {
		cookieCache: {
			// version: "1", // Change the version to invalidate all sessions
			enabled: true,
			maxAge: 7 * 24 * 60 * 60, // 7 days cache duration
			strategy: "jwe", // can be "jwt" or "compact"
			refreshCache: true, // Enable stateless refresh
		},
	},
	// 手動で有効にするには以下を追加
	advanced: {
		oauthConfig: {
			storeStateStrategy: "cookie",
		},
	},
	// 追加情報取るならcustomSessionを使う
	plugins: [
		customSession(async ({ user, session }) => {
			// 5秒タイムアウト
			const controller = new AbortController();
			setTimeout(() => controller.abort(), 5000);

			const res = await fetch(
				`https://mc56en2ync.execute-api.ap-northeast-1.amazonaws.com/dev/api/users/email/${encodeURIComponent(user.email)}`,
				{ signal: controller.signal },
			);

			// ステータスチェック（エラー時は自動的にスロー）
			if (!res.ok) {
				throw new Error(`API error: ${res.status}`);
			}

			const data: UserAPIResponse = await res.json();
			const { email: _email, ...userData } = data;

			return {
				user: { ...user, ...userData },
				session,
			};
		}),
	],
});

type UserAPIResponse = {
	user_code: string;
	user_name: string;
	user_name_kana: string;
	jig_cd: string;
	jig_name: string;
	syk_cd: string;
	syk_name: string;
	syz_cd: string;
	syz_name: string;
	is_production_users: boolean;
	email?: string | null;
};
