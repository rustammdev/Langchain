import { Router } from "express";
import { validate } from "../shared/middleware/validate.js";
import { ChatRequestSchema } from "../dto/chat.dto.js";
import ChatController from "../controllers/chat.controller.js";

export function createChatRouter(chatController: ChatController) {
  const router = Router();

  router.post(
    "/",
    validate(ChatRequestSchema),
    chatController.chat.bind(chatController)
  );

  router.delete('/:userId', chatController.clear.bind(chatController));

  router.post('/agent', validate(ChatRequestSchema), chatController.chatWithAgent.bind(chatController));

  return router;
}
