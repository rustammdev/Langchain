import { BaseCallbackHandler } from "@langchain/core/callbacks/base";
import type { LLMResult } from "@langchain/core/outputs";

export class TokenUsageHandler extends BaseCallbackHandler {
    name = "token_usage_handler";
    usage = { input_tokens: 0, output_tokens: 0, total_tokens: 0 };

    async handleLLMEnd(output: LLMResult) {
        const u: any =
            (output.llmOutput as any)?.tokenUsage ??
            (output.llmOutput as any)?.usage ??
            {};
        const input = u.promptTokens ?? u.input_tokens ?? u.prompt_tokens ?? 0;
        const completion =
            u.completionTokens ?? u.output_tokens ?? u.completion_tokens ?? 0;
        const total = u.totalTokens ?? u.total_tokens ?? input + completion;
        this.usage.input_tokens += input;
        this.usage.output_tokens += completion;
        this.usage.total_tokens += total;
    }
}

