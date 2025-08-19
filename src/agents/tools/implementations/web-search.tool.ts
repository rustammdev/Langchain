/**
 * Web search tools - DuckDuckGo and Wikipedia search
 * These tools are used for searching information from the internet
 */

import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { DuckDuckGoSearch } from "@langchain/community/tools/duckduckgo_search";
import { WikipediaQueryRun } from "@langchain/community/tools/wikipedia_query_run";
import type { IToolService } from "../base/tool.interface.js";

/**
 * DuckDuckGo search tool
 */
export class DuckDuckGoSearchToolService implements IToolService {
    readonly name = "duckduckgo_search";
    readonly description = "Performs internet search via DuckDuckGo";

    private searchTool: DuckDuckGoSearch;

    constructor() {
        this.searchTool = new DuckDuckGoSearch({
            maxResults: 5
        });
    }

    createTool() {
        return tool(
            async (input: { query: string }): Promise<string> => {
                try {
                    const { query } = input;

                    const results = await this.searchTool.invoke(query);

                    return results;

                } catch (error) {
                    return `Web search error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`;
                }
            },
            {
                name: this.name,
                description: this.description,
                schema: z.object({
                    query: z.string().min(1, "Search query cannot be empty")
                }),
            }
        );
    }
}

/**
 * Wikipedia search tool
 */
export class WikipediaSearchToolService implements IToolService {
    readonly name = "wikipedia_search";
    readonly description = "Performs search on Wikipedia";

    private wikiTool: WikipediaQueryRun;

    constructor() {
        this.wikiTool = new WikipediaQueryRun({
            topKResults: 3,
            maxDocContentLength: 2000,
        });
    }

    createTool() {
        return tool(
            async (input: { query: string }): Promise<string> => {
                try {
                    const { query } = input;

                    const results = await this.wikiTool.invoke(query);

                    return results;

                } catch (error) {
                    return `Wikipedia search error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`;
                }
            },
            {
                name: this.name,
                description: this.description,
                schema: z.object({
                    query: z.string().min(1, "Search query cannot be empty")
                }),
            }
        );
    }
}