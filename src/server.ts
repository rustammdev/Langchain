/**
 * Server - Ilovani ishga tushirish
 * 
 * Bu fayl ilovaning asosiy kirish nuqtasi hisoblanadi.
 * Redis ulanishini o'rnatadi va Express serverni ishga tushiradi.
 */

import { createApp } from "./app.js";
import { connectRedis } from "./common/redis/client.js";
import { config, validateConfig } from "./config/index.js";

/**
 * Asosiy server funksiyasi
 */
const main = async (): Promise<void> => {
    try {
        console.log("🚀 Server ishga tushirilmoqda...");

        // Konfiguratsiyani validatsiya qilish
        validateConfig();

        // Redis'ga ulanish
        console.log("🔗 Redis'ga ulanilmoqda...");
        await connectRedis();
        console.log("✅ Redis'ga muvaffaqiyatli ulandi");

        // Express ilovasini yaratish
        console.log("📦 Express ilovasi yaratilmoqda...");
        const app = createApp();
        console.log("✅ Express ilovasi yaratildi");

        // Serverni ishga tushirish
        const PORT = config.app.port;
        app.listen(PORT, () => {
            console.log("🎉 Server muvaffaqiyatli ishga tushdi!");
            console.log(`🌐 URL: http://localhost:${PORT}`);
            console.log(`📊 Muhit: ${config.app.node_env}`);
            console.log(`🤖 Default model: ${config.agent.default_model}`);

            // Mavjud endpoint'larni ko'rsatish
            console.log("\n📋 Mavjud endpoint'lar:");
            console.log("  GET  /                           - Salom xabari");
            console.log("  POST /ai/chat-with-memory/chat   - Oddiy chat");
            console.log("  POST /ai/chat-with-memory/agent  - Agent bilan chat");
            console.log("  GET  /ai/chat-with-memory/tools  - Tool'lar ro'yxati");
            console.log("  PUT  /ai/chat-with-memory/tools/:name - Tool'ni boshqarish");
            console.log("  DELETE /ai/chat-with-memory/history/:userId - Tarixni tozalash");
        });

    } catch (error) {
        console.error("❌ Server ishga tushirishda xatolik:", error);
        throw error;
    }
};

/**
 * Graceful shutdown uchun signal handler'lar
 */
const setupGracefulShutdown = (): void => {
    const shutdown = (signal: string) => {
        console.log(`\n🛑 ${signal} signal qabul qilindi. Server yopilmoqda...`);

        // Bu yerda cleanup ishlarini bajarish mumkin
        // Masalan: Redis ulanishini yopish, ochiq so'rovlarni kutish, va h.k.

        console.log("✅ Server yopildi");
        process.exit(0);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
};

// Graceful shutdown'ni sozlash
setupGracefulShutdown();

// Xatolarni ushlash va ilovani xavfsiz yopish
main().catch((error) => {
    console.error("💥 Fatal error:", error);
    process.exit(1);
});