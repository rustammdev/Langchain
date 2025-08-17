import { ChatService } from "../services/chat.service.js";
import { AgentService } from "../services/agent.service.js";
import type { Request, Response } from "express";
import { AppError } from "../../../common/utils/AppError.js";

class ChatController {
  constructor(
    private chatService: ChatService,
    private agentService: AgentService
  ) { }

  // Chat so'rovini qayta ishlash.
  async chat(req: Request, res: Response) {
    try {
      const { userId, input } = (req as any).validated as {
        userId: string;
        input: string;
      };
      const output = await this.chatService.send(input, userId);
      res.json({ userId, output });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: "ChatError", message: error?.message });
    }
  }

  // Tarixni tozalash so'rovini qayta ishlash.
  async clear(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      if (!userId) throw new AppError("UserId is required", 400);
      await this.chatService.clear(userId);
      await this.agentService.clear(userId);
      res.json({ message: "History cleared successfully" });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: "ClearError", message: e?.message });
    }
  }

  // Agent so'rovini qayta ishlash.
  async chatWithAgent(req: Request, res: Response) {
    try {
      const { userId, input } = (req as any).validated as {
        userId: string;
        input: string;
      };
      const output = await this.agentService.send(input, userId);
      res.json({ userId, output });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: "AgentError", message: e?.message });
    }
  }
}

export default ChatController;
