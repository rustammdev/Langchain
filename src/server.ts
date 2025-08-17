import { createApp } from "./app.js";
import { connectRedis } from "./common/redis/client.js";

const main = async () => {
    await connectRedis();
    const app = createApp();
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server listening on http://localhost:${PORT}`);
    });
}

// Xatolarni ushlash va ilovani xavfsiz yopish.
main().catch((e) => {
    console.error(e);
    process.exit(1); // Xato bo'lsa, ilovani to'xtatish.
});