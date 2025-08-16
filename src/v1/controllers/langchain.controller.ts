import { LangChainService } from "../services/simple-llm-chat.service.js";
import type { Request, Response } from "express";

export class LangChainController {
  private langChainService: LangChainService;

  constructor() {
    this.langChainService = new LangChainService();
  }

  /**
   * Handles simple LLM chat requests
   */
  async simpleLlmChat(req: Request, res: Response) {
    const response = await this.langChainService.simpleLlmChat();

    return res.json(response);
  }
}
