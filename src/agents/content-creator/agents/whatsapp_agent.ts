import type { WhatsAppOutput } from '../core/schemas.js';
import { BaseAgent } from './base_agent.js';

export class WhatsAppAgent extends BaseAgent<WhatsAppOutput> {
    protected platformName() { return 'WhatsApp'; }
    protected userPrompt(data: string, ctx: string[]) {
        return `
${data}

Context:
${ctx.join('\n')}

Return ONLY a valid JSON object. Do not add any text, comments, or code fences.

JSON format:
{
 "message": "Short, clear, 1-2 sentences, 1 CTA."
}
`;
    }
}