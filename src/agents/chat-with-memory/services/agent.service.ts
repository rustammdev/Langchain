// AgentService.ts
// Tool-calling qobiliyatiga ega agent xizmatini ta'minlaydi.
// LangChain va OpenAI modelidan foydalanadi, masalan, vaqtni olish kabi vositalarni qo'llab-quvvatlaydi.

import { RunnableWithMessageHistory } from "@langchain/core/runnables";
import { AgentExecutor, createOpenAIToolsAgent } from "langchain/agents";
import type { BaseChatMessageHistory } from "@langchain/core/chat_history";
import type { ChainValues } from "@langchain/core/utils/types";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { tool } from "@langchain/core/tools";
import { ChatOpenAI } from "@langchain/openai";
import { config } from "../../../config/index.js";
import { getMessageHistory } from "../storage/adapter.js";
import type { RedisChatHistoryStore } from "../storage/redisChatHistory.store.js";
import { z } from "zod";

export class AgentService {
  private executor!: AgentExecutor; // Agentni ishga tushirish uchun executor.
  private withHistory!: RunnableWithMessageHistory<
    { input: string },
    ChainValues
  >;
  private history: RedisChatHistoryStore;

  constructor(history: RedisChatHistoryStore) {
    this.history = history;
  }

  // Agent ishga tushirish
  async init() {
    const llm = new ChatOpenAI({
      apiKey: config.api_keys["open_ai"],
      model: "gpt-4o-mini-2024-07-18",
      temperature: 1,
    });

    // Vaqtni olish uchun oddiy vosita (tool).
    const timeTool = tool(async () => new Date().toISOString(), {
      name: "get_time",
      description: "Returns the current time in ISO format",
      schema: z.object({}),
    });

    // Prompt shablonini yaratish.
    const prompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        "You are an agent who helps the user. Use tools if necessary.",
      ],
      ["placeholder", "{history}"], // Tarix uchun joy.
      ["human", "{input}"], // Foydalanuvchi xabari.
      ["placeholder", "{agent_scratchpad}"], // Agent uchun majburiy.
    ]);

    // OpenAI agentini vositalar bilan yaratish.
    const agent = await createOpenAIToolsAgent({
      llm,
      tools: [timeTool],
      prompt,
    });
    this.executor = new AgentExecutor({
      agent,
      tools: [timeTool],
      // verbose: process.env.NODE_ENV === 'development' // Faqat development'da log'lar
    });

    // Tarix bilan ishlaydigan runnable yaratish
    this.withHistory = new RunnableWithMessageHistory({
      runnable: this.executor,
      getMessageHistory: async (
        sessionId: string
      ): Promise<BaseChatMessageHistory> => getMessageHistory(sessionId),

      inputMessagesKey: "input",
      historyMessagesKey: "history",
      outputMessagesKey: "output",
    });
  }

  // Foydalanuvchi xabarini yuborib, agent orqali javob olish.
  async send(input: string, userId: string): Promise<string> {
    if (!this.withHistory) await this.init(); // Agar hali init qilinmagan bo'lsa, boshlash.
    const res = await this.withHistory.invoke(
      { input },
      { configurable: { sessionId: userId } }
    );

    // ChainValues'dan faqat output'ni olish
    if (typeof res === "string") {
      return res;
    } else if (res && typeof res === "object" && "output" in res) {
      return res.output as string;
    } else {
      return JSON.stringify(res);
    }
  }

  // Tarixni tozalash.
  async clear(userId: string) {
    await this.history.clear(userId); // Redisda userId tarixini o'chirish.
  }
}
