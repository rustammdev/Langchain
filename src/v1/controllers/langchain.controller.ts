import { LangChainService } from "../services/simple-llm-chat.service.js";
import { SemanticSearchService } from "../services/semantic-search.service.js";
import type { Request, Response } from "express";
import { ToolCallingService } from "../services/tool-calling.service.js";

export class LangChainController {
  private langChainService: LangChainService;
  private semanticSearchService: SemanticSearchService;
  private toolCallingService: ToolCallingService;
  constructor() {
    this.langChainService = new LangChainService();
    this.semanticSearchService = new SemanticSearchService();
    this.toolCallingService = new ToolCallingService();
  }

  /**
   * Handles simple LLM chat requests
   */
  async simpleLlmChat(req: Request, res: Response) {
    const response = await this.langChainService.simpleLlmChat();

    return res.json(response);
  }

  /*
   * Tool calling
   */
  async toolCalling(req: Request, res: Response) {
    const input = "What is the weather in Tokyo?";
    // const input = "What is 2 * 3?";
    const result = await this.toolCallingService.call(input);
    res.json(result);
  }

  // advanced tool call
  async advancedToolCall(req: Request, res: Response) {
    // const input = "What is the weather in Tokyo?";
    const input =
      "What is this user last building projects: url: https://www.lazydev.uz/";
    const result = await this.toolCallingService.advancedCall(input);
    res.json(result);
  }
}
