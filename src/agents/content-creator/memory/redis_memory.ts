import { RedisChatMessageHistory } from '@langchain/community/stores/message/ioredis';
import { redis } from '../../../common/redis/client.js';
import { config } from '../../../config/index.js';

export const getChatHistory = (userId: string, topicId: string) => {
    const sessionId = `chat:history:${userId}:${topicId}`;
    return new RedisChatMessageHistory({
        sessionId,
        sessionTTL: config.agent.chat_history_ttl,
        client: redis,
    });
};