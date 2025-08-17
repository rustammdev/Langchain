import {
  AIMessage,
  HumanMessage,
  SystemMessage,
  ToolMessage,
  type BaseMessage,
} from "@langchain/core/messages";
import { redis } from "../../../common/redis/client.js";
import { config } from "../../../config/index.js";

type Stored = { type: string; content: string; meta?: Record<string, unknown> };

// LangChain xabarini JSON stringga aylantiradi (Redisga saqlash uchun).
function serialize(msg: BaseMessage): string {
  const payload: Stored = { type: msg.getType(), content: String(msg.content) };
  return JSON.stringify(payload);
}

// Redisda saqlangan JSON stringni LangChain xabariga aylantiradi.
function deserialize(s: string): BaseMessage {
  const obj = JSON.parse(s) as Stored;

  switch (obj.type) {
    case "human":
      return new HumanMessage(obj.content);
    case "ai":
      return new AIMessage(obj.content);
    case "system":
      return new SystemMessage(obj.content);
    case "tool":
      return new ToolMessage({
        tool_call_id: "n/a",
        content: obj.content,
        name: "tool",
      });
    default:
      return new SystemMessage(obj.content);
  }
}

// Chat tarixini boshqarish uchun sinf
export class RedisChatHistoryStore {
  // Har bir foydalanuvchi (sessionId) uchun Redis kalitini yaratadi.
  private key(sessionId: string) {
    return `chat:history:${sessionId}`;
  }

  // Berilgan sessionId bo'yicha barcha xabarlarni o'qiydi.
  async getMessages(sessionId: string): Promise<BaseMessage[]> {
    const rows = await redis.lRange(this.key(sessionId), 0, -1); // Redis listidan barcha xabarlarni olish.
    return rows.map(deserialize);
  }

  async addMessages(sessionId: string, messages: BaseMessage[]): Promise<void> {
    if (messages.length === 0) return;

    const key = this.key(sessionId);
    await redis.rPush(key, messages.map(serialize));

    const chatHistoryTtl = Number(config.agent.chat_history_ttl);
    if (chatHistoryTtl > 0) {
      await redis.expire(key, chatHistoryTtl);
    }
  }

  async clear(sessionId: string): Promise<void> {
    await redis.del(this.key(sessionId));
  }
}
