/**
 * 
 * This service handles tools operations.
 * Prerequisites
 * - Chat models ['https://js.langchain.com/docs/concepts/chat_models/']
 * 
 */


import { Tool, tool } from "@langchain/core/tools";
import { z } from "zod";
import { ChromaSearchService } from "./chroma-search.service.js";

/**
 * Service class for handling tools operations
 * recomendation : use tool function for simple tools
 */
export const multiplyTool = tool(
    async ({ a, b }: { a: number; b: number }) => {
        const result = a * b;
        return String(result);
    },
    {
        name: "multiply",
        description: "Multiply two numbers",
        schema: z.object({
            a: z.number(),
            b: z.number(),
        }),
    }
);

/**
 * Chroma search tool
 */
export const chromaSearchTool = tool(
    async ({ query, k }: { query: string, k: number }) => {
        console.log('IShlamoqdaman');
        console.log(query, k);

        const chromaSearchService = new ChromaSearchService();
        const response = await chromaSearchService.searchInChromaDB(query, k);
        console.log(response);

        return response;
    },
    {
        name: "chroma_search",
        description: "Search in ChromaDB in loaded pdf documents with semantic search algorithm",
        schema: z.object({
            query: z.string(),
            k: z.number(),
        }),
    }
);


// Tool with Async Function (Async funksiya bilan)
export const fetchDataTool = tool(async ({ url }: { url: string }) => {
    const response = await fetch(url);
    console.log('IShlamoqdama');


    // Check content type to determine how to handle the response
    const contentType = response.headers.get('content-type');

    if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        return JSON.stringify(data, null, 2);
    } else {
        // For HTML or other content types, return as text
        const text = await response.text();
        return text;
    }
}, {
    name: "fetch_data",
    description: "Fetch data from a URL (handles both JSON and HTML content)",
    schema: z.object({
        url: z.string().url()
    })
});

//  Custom Tool Class (Maxsus tool klassi)
class WeatherTool extends Tool {
    name = "weather";
    description = "Get weather information for a city";

    async _call(input: string) {
        // API chaqiruv yoki boshqa logika
        return `Weather in ${input}: Sunny, 25°C`;
    }
}

export const weatherTool = new WeatherTool();
