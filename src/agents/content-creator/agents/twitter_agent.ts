import type { TwitterOutput } from '../core/schemas.js';
import { BaseAgent } from './base_agent.js';

export class TwitterAgent extends BaseAgent<TwitterOutput> {
    protected platformName() { return 'Twitter'; }
    protected userPrompt(data: string, ctx: string[]) {
        return `
${data}

Context (optional): 
${ctx.join('\n')}

Return ONLY a valid JSON object. Do not add any text, comments, or code fences.

JSON format:
{
 "thread": ["tweet1", "tweet2", "tweet3"],
 "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3"]
}
`;
    }
}