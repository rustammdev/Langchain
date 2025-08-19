import { llm } from '../core/llm.js';
import { CRITIC_PROMPT } from '../core/prompts.js';

export const criticReview = async (text: string) => {
    const res = await llm.invoke([
        { role: 'system', content: 'You are a strict content quality critic.' },
        { role: 'user', content: `${CRITIC_PROMPT}\n\n---\nContent:\n${text}` }
    ]);
    try {
        return JSON.parse(typeof res.content === 'string' ? res.content : String(res.content));
    } catch {
        return { score: 0.7, issues: [], improvements: [] };
    }
};