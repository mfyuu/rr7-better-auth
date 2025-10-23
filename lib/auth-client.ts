import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	baseURL: "http://localhost:5173", // React Router v7のデフォルトポート
});

export const { useSession, signIn, signOut, signUp } = authClient;
