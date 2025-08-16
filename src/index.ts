import express from "express";
import { notFound } from "./common/middlewares/notFound.js";
import { errorHandler } from "./common/middlewares/errorHandler.js";
import langchainRouter from "./v1/routes/langchain.routes.js";
import semanticSearchRouter from "./v1/routes/semantic-search.routes.js";

const app = express();

// Middlewares
app.use(express.json());

// Routes
app.get("/", (_req, res) => {
  res.json({ ok: true, message: "Hello from Express + TypeScript!" });
});

app.use("/ai", langchainRouter);
app.use("/ai/semantic-search", semanticSearchRouter)

// 404 middleware — har doim route’lardan keyin
app.use(notFound);

// Global error handler — eng oxirgi middleware
app.use(errorHandler);
app.use;

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
