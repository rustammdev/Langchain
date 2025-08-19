/**
 * Chat Router - Chat and Agent endpoints
 * 
 * This router contains all endpoints related to chat and agent:
 * - Simple chat
 * - Chat with agent
 * - Clear history
 * - Manage tools
 */

import { Router } from "express";
import { validate } from "../shared/middleware/validate.js";
import { ChatRequestSchema, AgentRequestSchema, ToggleToolSchema } from "../dto/chat.dto.js";
import ChatController from "../controllers/chat.controller.js";

export function createChatRouter(chatController: ChatController) {
  const router = Router();

  // Simple chat endpoint
  router.post(
    "/chat",
    validate(ChatRequestSchema),
    chatController.chat.bind(chatController)
  );

  // Chat with agent endpoint
  router.post(
    "/agent",
    validate(AgentRequestSchema),
    chatController.chatWithAgent.bind(chatController)
  );

  // Clear history endpoint
  router.delete(
    "/history/:userId",
    chatController.clear.bind(chatController)
  );

  // Get tools list endpoint
  router.get(
    "/tools",
    chatController.getTools.bind(chatController)
  );

  // Toggle tool on/off endpoint
  router.put(
    "/tools/:toolName",
    validate(ToggleToolSchema),
    chatController.toggleTool.bind(chatController)
  );

  // Legacy endpoints (for backward compatibility)
  router.post(
    "/",
    validate(ChatRequestSchema),
    chatController.chat.bind(chatController)
  );

  router.delete(
    "/:userId",
    chatController.clear.bind(chatController)
  );

  return router;
}
