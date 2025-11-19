import { customSessionClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { auth } from "./auth";

export const authClient = createAuthClient({
	baseURL: "http://localhost:5173", // React Router v7のデフォルトポート
	plugins: [
		// customSessionClientプラグインを使用して、サーバー側のcustomSessionで追加した
		// カスタムフィールド（name_cdなど）をクライアント側で型安全に使用できるようにする
		// これにより、session.user.name_cd などのフィールドがTypeScriptで正しく推論される
		customSessionClient<typeof auth>(),
	],
});

export const { useSession, signIn, signOut, signUp } = authClient;
