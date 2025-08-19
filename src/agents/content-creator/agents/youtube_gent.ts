import type { YouTubeOutput } from '../core/schemas.js';
import { BaseAgent } from './base_agent.js';

export class YouTubeAgent extends BaseAgent<YouTubeOutput> {
    protected platformName() { return 'YouTube'; }
    protected userPrompt(data: string, ctx: string[]) {
        return `
${data}

Context:
${ctx.join('\n')}

Return ONLY a valid JSON object. Do not add any text, comments, or code fences.

JSON format:
{
 "title": "Your video title here",
 "description": "Your video description here",
 "video_script": "Your video script here",
 "tags": ["tag1", "tag2", "tag3"]
}
`;
    }
}