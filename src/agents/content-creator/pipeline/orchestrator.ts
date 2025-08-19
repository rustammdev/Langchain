import { type Platform, TopicInput } from '../core/schemas.js';
import { z } from 'zod';
import { getChatHistory } from '../memory/redis_memory.js';
import { upsertGenerated, upsertTopicSeed, maybeRetrieveContext } from '../vector/context_retriever.js';
import { agentFactory } from '../agents/agent_factory.js';
import { criticReview } from './critic.js';
import { enforceTwitterLimits } from './sanitizer.js';
import { llm } from '../core/llm.js';
import { SYSTEM_BASE } from '../core/prompts.js';
import { SystemMessage, AIMessage } from '@langchain/core/messages';
import { v4 as uuid } from 'uuid';

export type GenerationResult = {
    topicId: string;
    outputs: Record<Platform, any>;
    notes_for_human?: string[];
};

export class Orchestrator {
    async generate(input: z.infer<typeof TopicInput>): Promise<GenerationResult> {
        const topicId = input.topicId ?? uuid();
        if (!input.topicId) {
            await upsertTopicSeed(input.userId, topicId, input.data);
        }

        const history = getChatHistory(input.userId, topicId);
        await history.addMessage(new SystemMessage(SYSTEM_BASE));

        const extraContext = await maybeRetrieveContext({
            userId: input.userId,
            topicId,
            query: input.data,
            k: 4,
            scoreThreshold: 0.28,
        });

        const outputs: Record<Platform, any> = {} as any;
        const notes: string[] = [];

        for (const p of input.social_media) {
            const agent = agentFactory(p);
            const raw = await agent.generate(input.data, extraContext);

            // Minimal post-processing
            if (p === 'twitter' && 'thread' in raw) {
                raw.thread = enforceTwitterLimits(raw.thread);
            }

            const serialized = JSON.stringify(raw, null, 2);
            const critique = await criticReview(serialized);
            if (critique.improvements?.length) notes.push(`(${p}) ${critique.improvements.join(' | ')}`);

            // Optional: apply small refinement using improvements
            const refined = await this.refineIfNeeded(serialized, critique);
            outputs[p as Platform] = refined ?? raw;

            await upsertGenerated(input.userId, topicId, JSON.stringify(outputs[p as Platform]), [p]);

            await history.addMessage(new AIMessage(`[${p}] ${serialized}`));
        }

        return {
            topicId,
            outputs,
            ...(notes.length > 0 && { notes_for_human: notes })
        };
    }

    private async refineIfNeeded(serialized: string, critique: any) {
        if (!critique || critique.score >= 0.85 || !critique.improvements?.length) return null;
        const res = await llm.invoke([
            { role: 'system', content: 'You are a precise content editor. Apply only listed improvements.' },
            { role: 'user', content: `Original JSON:\n${serialized}\n\nImprovements:\n- ${critique.improvements.join('\n- ')}` }
        ]);
        try {
            return JSON.parse(typeof res.content === 'string' ? res.content : String(res.content));
        } catch {
            return null;
        }
    }
}