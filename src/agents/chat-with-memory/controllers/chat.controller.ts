/**
 * Chat Controller - Managing Chat and Agent requests
 * 
 * This controller receives user chat and agent requests,
 * routes them to appropriate services and returns responses.
 * 
 * Endpoints:
 * - POST /chat - Simple chat
 * - POST /agent - Chat with agent (with tools)
 * - DELETE /:userId - Clear user history
 * - GET /tools - List available tools
 * - PUT /tools/:toolName - Enable/disable tool
 */

import type { Request, Response } from "express";
import { ChatService } from "../services/chat.service.js";
import { AgentService, AgentType, type AgentConfig } from "../services/agent.service.js";
import { AppError } from "../../../common/utils/AppError.js";

class ChatController {
  constructor(
    private chatService: ChatService,
    private agentService: AgentService
  ) {
    console.log("🎮 ChatController created");
  }

  /**
   * Handle simple chat request
   * Simple LLM chat without tools
   */
  async chat(req: Request, res: Response): Promise<void> {
    try {
      const { userId, input } = (req as any).validated as {
        userId: string;
        input: string;
      };

      const output = await this.chatService.send(input, userId);

      res.json({
        success: true,
        userId,
        output,
        type: 'chat'
      });

    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: "ChatError",
        message: error?.message || "Error occurred in chat"
      });
    }
  }

  /**
   * Handle chat request with agent
   * Ability to work with tools
   */
  async chatWithAgent(req: Request, res: Response): Promise<void> {
    try {
      const { userId, input, agentType, enabledTools } = (req as any).validated as {
        userId: string;
        input: string;
        agentType?: AgentType;
        enabledTools?: string[];
      };

      // Agent configuration
      const agentConfig: Partial<AgentConfig> = {
        type: agentType || AgentType.OPENAI_TOOLS,
        ...(enabledTools && { enabledTools }),
      };

      const { output, usage } = await this.agentService.send(input, userId, agentConfig);

      res.json({
        success: true,
        userId,
        output,
        usage,
        type: 'agent',
        config: agentConfig
      });

    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: "AgentError",
        message: error?.message || "Error occurred in agent"
      });
    }
  }

  /**
   * Clear user history
   */
  async clear(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      if (!userId) {
        throw new AppError("UserId is required", 400);
      }

      // Clear chat and agent history
      await Promise.all([
        this.chatService.clear(userId),
        this.agentService.clear(userId)
      ]);

      res.json({
        success: true,
        message: "History cleared successfully",
        userId
      });

    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        error: "ClearError",
        message: error?.message || "Error occurred while clearing history"
      });
    }
  }

  /**
   * Get list of available tools
   */
  async getTools(req: Request, res: Response): Promise<void> {
    try {
      const tools = this.agentService.getAvailableTools();
      const status = this.agentService.getStatus();

      res.json({
        success: true,
        tools,
        status,
        total: tools.length,
        enabled: tools.filter(t => t.enabled).length
      });

    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: "ToolsError",
        message: error?.message || "Error occurred while getting tools list"
      });
    }
  }

  /**
   * Enable/disable tool
   */
  async toggleTool(req: Request, res: Response): Promise<void> {
    try {
      const { toolName } = req.params;
      const { enabled } = req.body;

      if (!toolName) {
        throw new AppError("Tool name is required", 400);
      }

      if (typeof enabled !== 'boolean') {
        throw new AppError("'enabled' must be a boolean value", 400);
      }

      this.agentService.setToolEnabled(toolName, enabled);

      res.json({
        success: true,
        message: `Tool ${enabled ? 'enabled' : 'disabled'}`,
        toolName,
        enabled
      });

    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        error: "ToggleToolError",
        message: error?.message || "Error occurred while changing tool status"
      });
    }
  }
}

export default ChatController;
