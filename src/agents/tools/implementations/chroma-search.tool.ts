/**
 * ChromaDB search tool - for semantic search
 * This tool performs search in PDF documents loaded in ChromaDB
 */

import { tool } from "@langchain/core/tools";
import { z } from "zod";
import type { IToolService } from "../base/tool.interface.js";
import { ChromaSearchService } from "../../../v1/services/chroma-search.service.js";

export class ChromaSearchToolService implements IToolService {
    readonly name = "chroma_semantic_search";
    readonly description = "Performs semantic search in PDF documents loaded in ChromaDB";

    private chromaService: ChromaSearchService;

    constructor() {
        this.chromaService = new ChromaSearchService();
    }

    /**
     * Create ChromaDB search tool
     * @returns Tool object
     */
    createTool() {
        return tool(
            async (input: { query: string; k?: number }): Promise<string> => {
                try {
                    const { query, k = 3 } = input;

                    // Perform search
                    const searchResult = await this.chromaService.searchInChromaDB(query, k);

                    // Format results
                    if (searchResult.results.length === 0) {
                        return "No matching results found.";
                    }

                    return JSON.stringify({
                        query,
                        results_count: searchResult.results.length,
                        results: searchResult.results.map((result, index) => ({
                            rank: index + 1,
                            content: result.content,
                            score: result.similarityScore,
                            metadata: result.metadata
                        }))
                    }, null, 2);

                } catch (error) {
                    return `Search error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`;
                }
            },
            {
                name: this.name,
                description: this.description,
                schema: z.object({
                    query: z.string().min(1, "Search query cannot be empty"),
                    k: z.number().min(1).max(20).optional().default(3)
                }),
            }
        );
    }
}