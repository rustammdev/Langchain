/**
 * 
 * This file defines the API routes for LangChain operations.
 * It provides endpoints for:
 * - Simple LLM chat: GET /simple-llm-chat
 * 
 */

import { Router } from "express";
import { LangChainController } from "../controllers/langchain.controller.js";

const router = Router();
const langChainController = new LangChainController();

router.get(
  "/simple-llm-chat",
  langChainController.simpleLlmChat.bind(langChainController)
);

export default router;
