import { Router } from 'express';
import { z } from 'zod';
import { TopicInput } from '../core/schemas.js';
import { Orchestrator } from '../pipeline/orchestrator.js';
import { getChatHistory } from '../memory/redis_memory.js';
import { HumanMessage } from '@langchain/core/messages';

const router = Router();
const orchestrator = new Orchestrator();

// POST /api/topics/generate
router.post('/generate', async (req, res, next) => {
    try {
        const body = TopicInput.parse(req.body);
        const result = await orchestrator.generate(body);
        res.json(result);
    } catch (e) {
        next(e);
    }
});

// GET /api/topics/:userId/:topicId/history
router.get('/:userId/:topicId/history', async (req, res, next) => {
    try {
        const { userId, topicId } = req.params;
        const history = getChatHistory(userId, topicId);
        const msgs = await history.getMessages();
        res.json({ userId, topicId, history: msgs });
    } catch (e) {
        next(e);
    }
});

// POST /api/topics/:userId/:topicId/message  (davomiy chat)
router.post('/:userId/:topicId/message', async (req, res, next) => {
    try {
        const { userId, topicId } = req.params;
        const schema = z.object({ message: z.string().min(1) });
        const { message } = schema.parse(req.body);

        const history = getChatHistory(userId, topicId);
        await history.addMessage(new HumanMessage(message));

        res.json({ status: 'ok' });
    } catch (e) {
        next(e);
    }
});

export default router;