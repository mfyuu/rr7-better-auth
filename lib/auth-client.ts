import { createAuthClient } from "better-auth/react";

/**
 * Better Authクライアント設定
 *
 * フロントエンド用の認証クライアント
 * Viteの環境変数（VITE_プレフィックス）からbaseURLを取得
 */
export const authClient = createAuthClient({
	baseURL: import.meta.env.VITE_BETTER_AUTH_URL || "http://localhost:5173",
});

export const { useSession, signIn, signOut, signUp } = authClient;
