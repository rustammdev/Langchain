import type { TelegramOutput } from '../core/schemas.js';
import { BaseAgent } from './base_agent.js';

export class TelegramAgent extends BaseAgent<TelegramOutput> {
    protected platformName() { return 'Telegram'; }
    protected userPrompt(data: string, ctx: string[]) {
        return `
${data}

Context:
${ctx.join('\n')}

Return ONLY a valid JSON object. Do not add any text, comments, or code fences.

JSON format:
{
 "post": "Your post content here",
 "buttons": [{ "text": "Join", "url": "https://example.com" }]
}
`;
    }
}