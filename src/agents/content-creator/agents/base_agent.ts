import { z } from 'zod';
import { llm } from '../core/llm.js';
import { SYSTEM_BASE } from '../core/prompts.js';

export abstract class BaseAgent<TOut> {
    constructor(private schema: z.ZodSchema<TOut>) { }

    protected abstract platformName(): string;
    protected abstract userPrompt(data: string, extraContext: string[]): string;

    async generate(data: string, extraContext: string[]) {
        const messages = [
            { role: 'system', content: this.system() },
            { role: 'user', content: this.userPrompt(data, extraContext) }
        ];
        const res = await llm.invoke(messages);
        let text = typeof res.content === 'string' ? res.content : JSON.stringify(res.content);

        // JSON parsing with multiple fallback strategies
        try {
            // Strategy 1: Direct JSON parse
            const json = JSON.parse(text);
            return this.schema.parse(json);
        } catch {
            try {
                // Strategy 2: Extract JSON from code blocks
                const codeBlockMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
                if (codeBlockMatch && codeBlockMatch[1]) {
                    const json = JSON.parse(codeBlockMatch[1]);
                    return this.schema.parse(json);
                }
            } catch {
                try {
                    // Strategy 3: Extract JSON object from text
                    const jsonMatch = text.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        const json = JSON.parse(jsonMatch[0]);
                        return this.schema.parse(json);
                    }
                } catch {
                    // Strategy 4: Try to fix common JSON issues
                    const cleanedText = text
                        .replace(/```json\s*/g, '')
                        .replace(/```\s*/g, '')
                        .replace(/^\s*\{/, '{')
                        .replace(/\}\s*$/, '}');

                    try {
                        const json = JSON.parse(cleanedText);
                        return this.schema.parse(json);
                    } catch {
                        throw new Error(`Failed to parse model output. Raw output: ${text.substring(0, 200)}...`);
                    }
                }
            }
        }

        throw new Error(`Failed to parse model output. Raw output: ${text.substring(0, 200)}...`);
    }

    protected system() {
        return `You are a ${this.platformName()} content generator.\n` +
            `Follow the master rules provided by the system.\n`;
    }


}