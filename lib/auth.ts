import { betterAuth } from "better-auth";
import dotenv from "dotenv";

dotenv.config();

const mockDatabase = {
  create: async (data: any) => {
    console.log("🔧 Mock database create:", data);
    return { id: "mock-id", ...data };
  },
  select: async (data: any) => {
    console.log("🔧 Mock database select:", data);
    return [];
  },
  update: async (data: any) => {
    console.log("🔧 Mock database update:", data);
    return { id: "mock-id", ...data };
  },
  delete: async (data: any) => {
    console.log("🔧 Mock database delete:", data);
    return { id: "mock-id" };
  },
};

export const auth = betterAuth({
  database: mockDatabase,
  secret: process.env.BETTER_AUTH_SECRET!,
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  trustedOrigins: ["http://localhost:5173"],
  baseURL: "http://localhost:5173",
  advanced: {
    generateId: () => "mock-id-" + Math.random().toString(36).substr(2, 9),
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  plugins: [],
});

console.log("✅ BetterAuth initialized");
