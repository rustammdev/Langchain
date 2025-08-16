/**
 * @fileoverview LangChain Service
 *
 * This service handles interactions with OpenAI's language models using LangChain.
 * It provides functionality for:
 * - Simple LLM chat interactions
 * - Prompt template management
 * - Message formatting for different use cases
 *
 */

import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { config } from "../../config/index.js";
import { AppError } from "../../common/utils/AppError.js";

/**
 * Service class for handling LangChain operations with OpenAI models
 */
export class LangChainService {
  private model: ChatOpenAI;

  constructor() {
    this.model = new ChatOpenAI({
      apiKey: config.api_keys.open_ai,
      model: "gpt-3.5-turbo",
    });
  }

  /**
   * Performs a simple LLM chat interaction using prompt templates
   * @returns {Promise<any>} The response from the language model
   * @throws {AppError} When there's an error in the LLM interaction
   */
  async simpleLlmChat() {
    try {
      const messages = this.createMessages();

      // Alternative: Direct message invocation
      // const response = await this.model.invoke(messages);

      // Using prompt template for better structure and reusability
      const promptValue = await this.createPromptTemplate(
        "Translate the following from English into Italian",
        "hi!"
      );
      const response = await this.model.invoke(promptValue);

      return response.content;
      // response only "Ciao!"
    } catch (error: any) {
      console.debug(error?.message);
      throw new AppError(error?.message, 500);
    }
  }

  /**
   * Creates a structured message array for LLM interaction
   * @returns {Array<SystemMessage | HumanMessage>} Array of formatted messages
   */
  private createMessages() {
    return [
      /**
       * SystemMessage: Pre-defined instruction that guides the LLM's behavior
       * The LLM will execute subsequent tasks based on this system instruction
       */
      new SystemMessage("Translate the following from English into Italian"),

      /**
       * HumanMessage: User input that needs to be processed
       */
      new HumanMessage("hi!"),
    ];
  }

  /**
   * Creates and executes a prompt template for structured LLM interactions
   * @param {string} language - The target language for translation
   * @param {string} text - The text to be translated
   * @returns {Promise<any>} The formatted prompt value ready for LLM invocation
   */
  private async createPromptTemplate(language: string, text: string) {
    const systemTemplate =
      "Translate the following from English into {language}";

    const promptTemplate = ChatPromptTemplate.fromMessages([
      ["system", systemTemplate],
      ["user", "{text}"],
    ]);

    /**
     * Invoking the prompt template doesn't send a request to the LLM
     * It converts the template into a format that the LLM can accept
     */
    const promptValue = await promptTemplate.invoke({
      language: language,
      text: text,
    });

    // Alternative: Convert to chat messages format
    // const chatMessages = promptValue.toChatMessages();

    return promptValue;
  }
}
