import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// .env ni yuklash
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// Majburiy env ozgaruvchilar
function requireEnv(name: string): string {
  const value = process.env[name];

  if (value === undefined || value === "") {
    throw new Error(`❌ Missing required environment variable: ${name}`);
  }

  return value;
}

// config obyekt
export const config = {
  app: {
    port: parseInt(requireEnv("PORT"), 10),
  },
  api_keys: {
    open_ai: requireEnv("OPENAI_API_KEY"),
  },
};
