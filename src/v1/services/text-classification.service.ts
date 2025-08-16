/**
 * 
 * This service handles text classification operations using LangChain.
 * It provides functionality for:
 * - Text sentiment analysis
 * - Language detection
 * - Content categorization
 * - Style classification
 * 
 * Based on: https://js.langchain.com/docs/tutorials/classification
 * 
 */

import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";
import { config } from "../../config/index.js";
import { AppError } from "../../common/utils/AppError.js";

/**
 * Service class for handling text classification operations
 */
export class TextClassificationService {
    private model: ChatOpenAI;

    constructor() {
        this.model = new ChatOpenAI({
            apiKey: config.api_keys.open_ai,
            model: "gpt-3.5-turbo",
            temperature: 0
        });
    }


    /**
     * Classification schema
     */
    private classificationSchema() {
        return z.object({
            sentiment: z
                .enum(["happy", "neutral", "sad", "angry", "fearful", "disgusted", "surprised"])
                .describe("The sentiment of the text"),
            language: z.string().describe("Language of the text"),
            aggressiveness: z.enum(["low", "medium", "high"]).describe("Aggressiveness of the text"),
            aggressiveness_level: z
                .number()
                .int()
                .describe("How aggressive the text is on a scale from 1 to 10"),
        })
    }

    /**
     * Simple classification
     */
    async simpleClassification() {
        try {
            const taggingPromptTemplate = ChatPromptTemplate.fromTemplate(
                `Extract the desired information from the following passage.

                Only extract the properties mentioned in the 'Classification' function.

                Passage:
                {input}
                `
            )


            const schema = this.classificationSchema();
            const llmWithStructuredOutput = this.model.withStructuredOutput(schema, { name: "extractor" });

            const prompt_1 = await taggingPromptTemplate.invoke({
                input: "I'm incredibly glad I met you! I think we'll be very good friends!"
            })

            const response = await llmWithStructuredOutput.invoke(prompt_1);

            return response;
        } catch (error: any) {
            throw new AppError(`Failed to classify text: ${error?.message}`, 500);
        }
    }
}
