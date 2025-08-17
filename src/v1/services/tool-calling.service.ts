/**
 * Tool calling service
 */

import { ChatOpenAI, type ChatOpenAICallOptions } from "@langchain/openai";
import { config } from "../../config/index.js";
import type { Tool } from "langchain/tools";
import { multiplyTool, fetchDataTool, weatherTool } from "./tools.service.js";
import type { Runnable } from "@langchain/core/runnables";
import type { BaseLanguageModelInput } from "@langchain/core/language_models/base";
import {
    HumanMessage,
    SystemMessage,
    ToolMessage,
    type AIMessageChunk,
    type BaseMessage,
} from "@langchain/core/messages";
import { randomUUID } from "crypto";

type CallResult = {
    text: string;
    steps: { tool: string; args: unknown; result: unknown }[];
};

/**
 * Service class for handling ChromaDB-based semantic search operations
 */
export class ToolCallingService {
    private model: ChatOpenAI;
    private modelWithTools: Runnable<
        BaseLanguageModelInput,
        AIMessageChunk,
        ChatOpenAICallOptions
    > | null = null;
    private tools: Tool[] = [];

    constructor() {
        this.model = new ChatOpenAI({
            apiKey: config.api_keys.open_ai,
            model: "gpt-4o-mini",
            temperature: 0,
        });
        const multiply = multiplyTool as unknown as Tool;
        const fetchData = fetchDataTool as unknown as Tool;
        const weather = weatherTool as unknown as Tool;

        // all tools
        this.addTools([multiply, fetchData, weather]);
    }

    private addTools(tools: Tool[]) {
        this.tools.push(...tools);

        // Har safar yangilab bog'laymiz
        this.modelWithTools = this.model.bindTools(this.tools);
    }

    async call(input: string) {
        if (!this.modelWithTools) {
            throw new Error("Model with tools is not initialized");
        }
        const result = await this.modelWithTools.invoke(input);
        return result;
    }

    async advancedCall(input: string, system?: string) {
        const messages: BaseMessage[] = [];

        if (system) messages.push(new SystemMessage(system));
        messages.push(new HumanMessage(input));

        if (!this.modelWithTools) {
            throw new Error("Model with tools is not initialized");
        }
        let ai = await this.modelWithTools.invoke(messages);

        const steps: CallResult["steps"] = [];

        // Tool calling loop
        while (ai.tool_calls && ai.tool_calls.length > 0) {
            const toolMessages: ToolMessage[] = [];

            for (const call of ai.tool_calls) {
                const t = this.tools.find((t) => t.name === call.name);

                // Agar tool topilmasa
                if (!t) {
                    toolMessages.push(
                        new ToolMessage({
                            tool_call_id: call.id ?? randomUUID(),
                            name: call.name,
                            content: `Tool "${call.name}" topilmadi.`,
                        })
                    );
                    continue;
                }

                const result = await t.invoke(call.args);
                steps.push({ tool: call.name, args: call.args, result });

                toolMessages.push(
                    new ToolMessage({
                        tool_call_id: call.id ?? randomUUID(),
                        name: call.name,
                        content:
                            typeof result === "string" ? result : JSON.stringify(result),
                    })
                );
            }

            messages.push(ai, ...toolMessages);
            ai = await this.modelWithTools.invoke(messages);
        }

        return { ai, steps };
    }
}
