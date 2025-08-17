import type { BaseMessage } from "@langchain/core/messages";

export interface ChatHistoryStore {
  getMessages(sessionId: string): Promise<BaseMessage[]>;
  addMessages(sessionId: string, messages: BaseMessage[]): Promise<void>;
  clear(sessionId: string): Promise<void>;
}
