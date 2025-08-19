/**
 * Data fetching tool - for retrieving data from URLs
 * This tool fetches JSON or HTML data from given URLs
 */

import { tool } from "@langchain/core/tools";
import { z } from "zod";
import type { IToolService } from "../base/tool.interface.js";

export class FetchDataToolService implements IToolService {
    readonly name = "fetch_web_data";
    readonly description = "Fetches data from given URL (supports JSON and HTML formats)";

    /**
     * Create data fetching tool
     * @returns Tool object
     */
    createTool() {
        return tool(
            async (input: { url: string; timeout?: number }): Promise<string> => {
                try {
                    const { url, timeout = 10000 } = input;

                    console.log(`🌐 Fetching data from URL: ${url}`);

                    // URL validation
                    const urlObj = new URL(url);
                    if (!['http:', 'https:'].includes(urlObj.protocol)) {
                        throw new Error("Only HTTP and HTTPS protocols are supported");
                    }

                    // Fetch with timeout
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), timeout);

                    const response = await fetch(url, {
                        signal: controller.signal,
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (compatible; AI-Agent/1.0)',
                        }
                    });

                    clearTimeout(timeoutId);

                    if (!response.ok) {
                        throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
                    }

                    // Check content type
                    const contentType = response.headers.get('content-type') || '';

                    let result: string;

                    if (contentType.includes('application/json')) {
                        const data = await response.json();
                        result = JSON.stringify(data, null, 2);
                    } else if (contentType.includes('text/')) {
                        result = await response.text();
                    } else {
                        result = await response.text();
                    }

                    // Truncate very long texts
                    if (result.length > 5000) {
                        result = result.substring(0, 5000) + "\n\n[Text truncated...]";
                    }

                    return result;

                } catch (error) {
                    if (error instanceof Error) {
                        if (error.name === 'AbortError') {
                            return "Request timeout";
                        }
                        return `Error fetching data: ${error.message}`;
                    }

                    return "Unknown error occurred";
                }
            },
            {
                name: this.name,
                description: this.description,
                schema: z.object({
                    url: z.string().url("Please enter a valid URL format"),
                    timeout: z.number().min(1000).max(30000).optional().default(10000)
                }),
            }
        );
    }
}