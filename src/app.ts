import express from "express";
import { notFound } from "./common/middlewares/notFound.js";
import { errorHandler } from "./common/middlewares/errorHandler.js";
import langchainRouter from "./v1/routes/langchain.routes.js";
import semanticSearchRouter from "./v1/routes/semantic-search.routes.js";
import chromaSearchRouter from "./v1/routes/chroma-search.routes.js";
import textClassificationRouter from "./v1/routes/text-classification.routes.js";
import { RedisChatHistoryStore } from "./agents/chat-with-memory/storage/redisChatHistory.store.js";
import { AgentService } from "./agents/chat-with-memory/services/agent.service.js";
import ChatController from "./agents/chat-with-memory/controllers/chat.controller.js";
import { ChatService } from "./agents/chat-with-memory/services/chat.service.js";
import { createChatRouter } from "./agents/chat-with-memory/routes/chat-with-memory.route.js";
import topics from './agents/content-creator/routes/topics.route.js';

export function createApp() {
    const app = express();

    // Middlewares
    app.use(express.json());

    // Redis tarix saqlash obyekti.
    const historyStore = new RedisChatHistoryStore();
    // Chat xizmati (oddiy chat uchun).
    const chatService = new ChatService(historyStore);
    // Agent xizmati (tool-calling uchun).
    const agentService = new AgentService(historyStore);

    // Chat va agent so'rovlarini boshqarish uchun controller.
    const chatController = new ChatController(chatService, agentService);

    // Routes
    app.get("/", (_req, res) => {
        res.json({ ok: true, message: "Hello from Express + TypeScript!" });
    });

    app.use("/ai", langchainRouter);
    app.use("/ai/semantic-search", semanticSearchRouter);
    app.use("/ai/chroma-search", chromaSearchRouter);
    app.use("/ai/text-classification", textClassificationRouter);
    app.use("/ai/chat-with-memory", createChatRouter(chatController));
    app.use("/ai/topics", topics);
    // 404 middleware — har doim route'lardan keyin
    app.use(notFound);

    // Global error handler — eng oxirgi middleware
    app.use(errorHandler);

    return app;
}
