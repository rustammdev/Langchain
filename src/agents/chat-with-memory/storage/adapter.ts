import { BaseListChatMessageHistory } from "@langchain/core/chat_history";
import { BaseMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
import { RedisChatHistoryStore } from "./redisChatHistory.store.js";

const store = new RedisChatHistoryStore();

class SessionHistory extends BaseListChatMessageHistory {
    lc_namespace = ["langchain", "chat_history", "redis"];

    constructor(private sessionId: string) {
        super();
    }

    async getMessages(): Promise<BaseMessage[]> {
        return store.getMessages(this.sessionId);
    }

    async addMessage(message: BaseMessage): Promise<void> {
        await store.addMessages(this.sessionId, [message]);
    }

    async addMessages(messages: BaseMessage[]): Promise<void> {
        await store.addMessages(this.sessionId, messages);
    }

    async clear(): Promise<void> {
        await store.clear(this.sessionId);
    }

    async addUserMessage(message: string): Promise<void> {
        await this.addMessage(new HumanMessage(message));
    }

    async addAIChatMessage(message: string): Promise<void> {
        await this.addMessage(new AIMessage(message));
    }
}

export async function getMessageHistory(sessionId: string): Promise<BaseListChatMessageHistory> {
    return new SessionHistory(sessionId);
}