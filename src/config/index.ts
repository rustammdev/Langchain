/**
 * Konfiguratsiya fayli - Environment variables va app sozlamalari
 * 
 * Bu fayl barcha environment variables'larni yuklaydi va
 * ilovaning asosiy konfiguratsiyasini ta'minlaydi.
 */

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// .env faylini yuklash
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

/**
 * Majburiy environment variable'ni olish
 * @param name Variable nomi
 * @returns Variable qiymati
 * @throws Error agar variable topilmasa
 */
function requireEnv(name: string): string {
  const value = process.env[name];

  if (value === undefined || value === "") {
    throw new Error(`❌ Majburiy environment variable topilmadi: ${name}`);
  }

  return value;
}

/**
 * Ixtiyoriy environment variable'ni olish
 * @param name Variable nomi
 * @param defaultValue Default qiymat
 * @returns Variable qiymati yoki default qiymat
 */
function getEnv(name: string, defaultValue: string): string {
  return process.env[name] || defaultValue;
}

/**
 * Asosiy konfiguratsiya obyekti
 */
export const config = {
  // Ilova sozlamalari
  app: {
    port: parseInt(getEnv("PORT", "3000"), 10),
    redis_url: requireEnv("REDIS_URL"),
    node_env: getEnv("NODE_ENV", "development"),
  },

  // API kalitlari
  api_keys: {
    open_ai: requireEnv("OPENAI_API_KEY"),
  },

  others: {
    redisUrl: getEnv("REDIS_URL", "redis://localhost:6379"),
    chromaUrl: getEnv("CHROMA_URL", "http://localhost:8000"),
  },

  // Agent sozlamalari
  agent: {
    chat_history_ttl: parseInt(getEnv("CHAT_HISTORY_TTL", "604800"), 10), // 7 kun
    default_model: getEnv("MODEL", "gpt-4o-mini-2024-07-18"),
    default_temperature: parseFloat(getEnv("TEMPERATURE", "0.7")),
    max_iterations: parseInt(getEnv("MAX_ITERATIONS", "10"), 10),
    verbose: getEnv("AGENT_VERBOSE", "false") === "true",
  },

  // Tool sozlamalari
  tools: {
    duckduckgo_max_results: parseInt(getEnv("DUCKDUCKGO_MAX_RESULTS", "5"), 10),
    wikipedia_max_results: parseInt(getEnv("WIKIPEDIA_MAX_RESULTS", "3"), 10),
    wikipedia_max_content_length: parseInt(getEnv("WIKIPEDIA_MAX_CONTENT_LENGTH", "2000"), 10),
    fetch_timeout: parseInt(getEnv("FETCH_TIMEOUT", "10000"), 10),
  },
};

/**
 * Konfiguratsiyani validatsiya qilish
 */
export function validateConfig(): void {
  console.log("🔧 Konfiguratsiya tekshirilmoqda...");

  // Port validatsiyasi
  if (isNaN(config.app.port) || config.app.port < 1 || config.app.port > 65535) {
    throw new Error("❌ Noto'g'ri PORT qiymati");
  }

  // OpenAI API key validatsiyasi
  if (!config.api_keys.open_ai.startsWith("sk-")) {
    throw new Error("❌ Noto'g'ri OPENAI_API_KEY formati");
  }

  // Redis URL validatsiyasi
  if (!config.app.redis_url.startsWith("redis://")) {
    throw new Error("❌ Noto'g'ri REDIS_URL formati");
  }

  console.log("✅ Konfiguratsiya to'g'ri");
  console.log(`📊 Muhit: ${config.app.node_env}`);
  console.log(`🚀 Port: ${config.app.port}`);
  console.log(`🤖 Default model: ${config.agent.default_model}`);
}
