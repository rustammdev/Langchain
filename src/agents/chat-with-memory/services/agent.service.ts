/**
 * Agent Service - Service with tool-calling capabilities
 * 
 * This service uses LangChain and OpenAI models to work with various tools.
 * The agent automatically selects and uses the necessary tools when responding
 * to user requests.
 * 
 * Supported tools:
 * - Time retrieval
 * - ChromaDB search
 * - Web search (DuckDuckGo, Wikipedia)
 * - Data fetching from URLs
 * - Mathematical operations
 */

import { RunnableWithMessageHistory } from "@langchain/core/runnables";
import { AgentExecutor, createOpenAIToolsAgent, createReactAgent } from "langchain/agents";
import type { BaseChatMessageHistory } from "@langchain/core/chat_history";
import type { ChainValues } from "@langchain/core/utils/types";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { pull } from "langchain/hub";

// Internal imports
import { config } from "../../../config/index.js";
import { getMessageHistory } from "../storage/adapter.js";
import type { RedisChatHistoryStore } from "../storage/redisChatHistory.store.js";
import { TokenUsageHandler } from "../shared/utils/token-useage.handler.js";
import { ToolRegistry } from "../../tools/tool-registry.js";

/**
 * Agent types
 */
export enum AgentType {
  OPENAI_TOOLS = "openai_tools",
  REACT = "react"
}

/**
 * Agent configuration
 */
export interface AgentConfig {
  type: AgentType;
  model: string;
  temperature: number;
  enabledTools?: string[];
  verbose?: boolean;
}

/**
 * Agent response interface
 */
export interface AgentResponse {
  output: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
  };
}

export class AgentService {
  private executor?: AgentExecutor | undefined;
  private withHistory?: RunnableWithMessageHistory<{ input: string; }, ChainValues> | undefined;
  private history: RedisChatHistoryStore;
  private toolRegistry: ToolRegistry;
  private currentConfig?: AgentConfig | undefined;

  constructor(history: RedisChatHistoryStore) {
    this.history = history;
    this.toolRegistry = new ToolRegistry();

    console.log("🤖 AgentService created");
  }

  /**
   * Initialize OpenAI Tools Agent
   * This agent uses OpenAI's function calling capabilities
   * 
   * @param agentConfig Agent configuration
   */
  private async initOpenAIToolsAgent(agentConfig: AgentConfig): Promise<void> {
    // Create LLM model using global config
    const llm = new ChatOpenAI({
      apiKey: config.api_keys.open_ai,
      model: agentConfig.model,
      temperature: agentConfig.temperature,
    });

    // Get tools
    const tools = agentConfig.enabledTools
      ? this.toolRegistry.getSpecificTools(agentConfig.enabledTools)
      : this.toolRegistry.getEnabledTools();


    // Create system prompt
    const prompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        `You are an AI assistant that helps users. 
        You have various tools available and should use them when needed.
        
        Rules:
        - Provide clear and helpful responses to users
        - Use tools only when necessary
        - Respond in the user's language when possible
        - If information is not found, clearly state this
        
        Available tools: ${tools.map(t => t.name).join(', ')}`
      ],
      ["placeholder", "{history}"],
      ["human", "{input}"],
      ["placeholder", "{agent_scratchpad}"],
    ]);

    // Create agent
    const agent = await createOpenAIToolsAgent({
      llm,
      tools,
      prompt,
    });

    // Create executor
    this.executor = new AgentExecutor({
      agent,
      tools,
      verbose: agentConfig.verbose || false,
      maxIterations: 10, // Prevent infinite loops
      earlyStoppingMethod: "generate", // Stop when response is found
    });

  }

  /**
   * Initialize React Agent
   * This agent uses ReAct (Reasoning + Acting) methodology
   * 
   * @param agentConfig Agent configuration
   */
  private async initReactAgent(agentConfig: AgentConfig): Promise<void> {
    // Create LLM model using global config
    const llm = new ChatOpenAI({
      apiKey: config.api_keys.open_ai,
      model: agentConfig.model,
      temperature: agentConfig.temperature,
    });

    // Get tools
    const tools = agentConfig.enabledTools
      ? this.toolRegistry.getSpecificTools(agentConfig.enabledTools)
      : this.toolRegistry.getEnabledTools();


    // Get ReAct prompt from LangChain Hub
    const prompt = (await pull("hwchase17/react")) as ChatPromptTemplate;

    // Create agent
    const agent = await createReactAgent({
      llm,
      tools,
      prompt,
    });

    // Create executor
    this.executor = new AgentExecutor({
      agent,
      tools,
      verbose: agentConfig.verbose || false,
      maxIterations: 10,
      earlyStoppingMethod: "generate",
    });

  }

  /**
   * Initialize the agent
   * 
   * @param agentConfig Agent configuration
   */
  private async initializeAgent(agentConfig: AgentConfig): Promise<void> {
    try {
      // Don't reinitialize if same configuration
      if (this.currentConfig && JSON.stringify(this.currentConfig) === JSON.stringify(agentConfig)) {
        return;
      }


      // Initialize agent based on type
      switch (agentConfig.type) {
        case AgentType.OPENAI_TOOLS:
          await this.initOpenAIToolsAgent(agentConfig);
          break;
        case AgentType.REACT:
          await this.initReactAgent(agentConfig);
          break;
        default:
          throw new Error(`Unknown agent type: ${agentConfig.type}`);
      }

      // Create runnable with history
      this.withHistory = new RunnableWithMessageHistory({
        runnable: this.executor!,
        getMessageHistory: async (sessionId: string): Promise<BaseChatMessageHistory> =>
          getMessageHistory(sessionId),
        inputMessagesKey: "input",
        historyMessagesKey: "history",
        outputMessagesKey: "output",
      });

      this.currentConfig = agentConfig;

    } catch (error) {
      console.error("❌ Error initializing agent:", error);
      throw new Error(`Error initializing agent: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Send user message and get response from agent
   * 
   * @param input User message
   * @param userId User ID
   * @param agentConfig Agent configuration (optional)
   * @returns Agent response and token statistics
   */
  async send(input: string, userId: string, agentConfig?: Partial<AgentConfig>): Promise<AgentResponse> {
    try {
      // Default configuration
      const finalConfig: AgentConfig = {
        type: AgentType.OPENAI_TOOLS,
        model: "gpt-4o-mini-2024-07-18",
        temperature: 0.7,
        verbose: process.env.NODE_ENV === 'development',
        ...agentConfig
      };

      // Initialize agent
      await this.initializeAgent(finalConfig);

      // Token usage handler
      const tokenUsageHandler = new TokenUsageHandler();

      // Send message to agent
      const response = await this.withHistory!.invoke(
        { input },
        {
          configurable: { sessionId: userId },
          callbacks: [tokenUsageHandler]
        }
      );

      // Format response
      let output: string;
      if (typeof response === "string") {
        output = response;
      } else if (response && typeof response === "object" && "output" in response) {
        output = response.output as string;
      } else {
        output = JSON.stringify(response);
      }

      return {
        output,
        usage: tokenUsageHandler.usage
      };

    } catch (error) {
      console.error("❌ Error sending message to agent:", error);
      throw new Error(`Error sending message to agent: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Enable/disable tool
   * 
   * @param toolName Tool name
   * @param enabled Enable/disable
   */
  setToolEnabled(toolName: string, enabled: boolean): void {
    this.toolRegistry.setToolEnabled(toolName, enabled);

    // Reset configuration (to reinitialize on next request)
    this.currentConfig = undefined;
  }

  /**
   * Get all available tools
   * 
   * @returns Tool configurations
   */
  getAvailableTools() {
    return this.toolRegistry.getAllToolConfigs();
  }

  /**
   * Clear user history
   * 
   * @param userId User ID
   */
  async clear(userId: string): Promise<void> {
    try {
      console.log(`🧹 Clearing user history: ${userId}`);
      await this.history.clear(userId);
      console.log(`✅ User history cleared: ${userId}`);
    } catch (error) {
      console.error("❌ Error clearing history:", error);
      throw new Error(`Error clearing history: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get agent status
   * 
   * @returns Information about agent status
   */
  getStatus() {
    return {
      initialized: !!this.executor,
      currentConfig: this.currentConfig,
      availableTools: this.toolRegistry.getAllToolConfigs().length,
      enabledTools: this.toolRegistry.getAllToolConfigs().filter(t => t.enabled).length
    };
  }
}

