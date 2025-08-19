import type { InstagramOutput } from '../core/schemas.js';
import { BaseAgent } from './base_agent.js';

export class InstagramAgent extends BaseAgent<InstagramOutput> {
    protected platformName() { return 'Instagram'; }
    protected userPrompt(data: string, ctx: string[]) {
        return `
${data}

Context:
${ctx.join('\n')}

Return ONLY a valid JSON object. Do not add any text, comments, or code fences.

JSON format:
{
 "caption": "Your caption here",
 "video_script": "Your video script here",
 "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3"]
}
`;
    }
}