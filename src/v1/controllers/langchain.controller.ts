import { LangChainService } from "../services/langchain.service.js";
import type { Request, Response } from "express";

export class LangChainController {
  private langChainService: LangChainService;

  constructor() {
    this.langChainService = new LangChainService();
  }

  async simpleLlmChat(req: Request, res: Response) {
    const response = await this.langChainService.simpleLlmChat();

    return res.json(response);
  }
}
