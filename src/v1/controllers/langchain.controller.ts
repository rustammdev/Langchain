import { LangChainService } from "../services/simple-llm-chat.service.js";
import { SemanticSearchService } from "../services/semantic-search.service.js";
import type { Request, Response } from "express";

export class LangChainController {
  private langChainService: LangChainService;
  private semanticSearchService: SemanticSearchService;
  constructor() {
    this.langChainService = new LangChainService();
    this.semanticSearchService = new SemanticSearchService();
  }

  /**
   * Handles simple LLM chat requests
   */
  async simpleLlmChat(req: Request, res: Response) {
    const response = await this.langChainService.simpleLlmChat();

    return res.json(response);
  }


}
