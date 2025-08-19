/**
 * Time tool - returns current time
 * This tool is used to show the current time to the user
 */

import { tool } from "@langchain/core/tools";
import { z } from "zod";
import type { IToolService } from "../base/tool.interface.js";

export class TimeToolService implements IToolService {
    readonly name = "get_current_time";
    readonly description = "Returns current time in ISO format";

    /**
     * Create time tool
     * @returns Tool object
     */
    createTool() {
        return tool(
            async (): Promise<string> => {
                try {
                    const currentTime = new Date().toISOString();
                    return currentTime;
                } catch (error) {
                    throw new Error("Error occurred while getting time");
                }
            },
            {
                name: this.name,
                description: this.description,
                schema: z.object({}), // No parameters needed
            }
        );
    }
}