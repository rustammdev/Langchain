// ChatService.ts
// LangChain va OpenAI modelidan foydalanib, oddiy chat xizmatini ta'minlaydi.
// RedisChatHistoryStore bilan integratsiya qilib, oldingi suhbat kontekstini hisobga oladi.

import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";
import { ChatOpenAI } from "@langchain/openai";
import type { RedisChatHistoryStore } from "../storage/redisChatHistory.store.js";
import { config } from "../../../config/index.js";
import { StringOutputParser } from "@langchain/core/output_parsers";
import type { BaseMessage } from "@langchain/core/messages";
import type { BaseChatMessageHistory } from "@langchain/core/chat_history";
import { getMessageHistory } from "../storage/adapter.js";

export class ChatService {
  private model: ChatOpenAI;
  private prompt: ChatPromptTemplate;
  private chain: any; // Prompt -> model -> parser zanjiri.
  private withHistory: RunnableWithMessageHistory<{ input: string }, string>; // Tarix bilan ishlaydigan runnable.
  private history: RedisChatHistoryStore; // Tarixni saqlash uchun Redis store.

  constructor(history: RedisChatHistoryStore) {
    this.history = history; // Redis storeni saqlash

    // OpenAI modelini sozlash (API kaliti, model nomi, temperature).
    this.model = new ChatOpenAI({
      apiKey: config.api_keys["open_ai"],
      model: "gpt-4o-mini-2024-07-18",
      temperature: 1,
    });

    // Prompt shablonini yaratish: system xabari, tarix va foydalanuvchi inputi
    this.prompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        "You are the assistant principal. Use the context of previous conversations.",
      ],
      ["placeholder", "{history}"], // Oldingi xabarlar uchun joy.
      ["human", "{input}"],
    ]);

    // Zanjir: promptni modelga, keyin string parserga ulash.
    this.chain = this.prompt.pipe(this.model).pipe(new StringOutputParser());

    // Tarix bilan ishlaydigan runnable yaratish
    this.withHistory = new RunnableWithMessageHistory({
      runnable: this.chain, // Asosiy zanjir
      getMessageHistory: async (
        sessionId: string
      ): Promise<BaseChatMessageHistory> => getMessageHistory(sessionId),

      inputMessagesKey: "input",
      historyMessagesKey: "history",
      outputMessagesKey: "output",
    });
  }

  // Foydalanuvchi xabarini yuborib, javob olish.
  async send(input: string, userId: string): Promise<string> {
    const res = await this.withHistory.invoke(
      { input }, // Foydalanuvchi habari,
      { configurable: { sessionId: userId } } // Tarixni userId bo'yicha yuklash
    );

    return res;
  }

  // Tarixni tozalash
  async clear(userId: string): Promise<void> {
    await this.history.clear(userId);
  }

  // Ixtiyoriy: Faqat oxirgi N xabarni yuborish yoki sliding window/summarizatsiya qo'shish mumkin.
}
