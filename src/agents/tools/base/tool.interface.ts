/**
 * Tool interface - base interface for all tools
 * This interface defines the common structure for all tools
 */

import type { Tool } from "@langchain/core/tools";

export interface IToolService {
    /**
     * Create and return the tool
     * @returns Tool object (can be any subtype of Tool)
     */
    createTool(): Tool | any;

    /**
     * Tool name
     */
    readonly name: string;

    /**
     * Tool description
     */
    readonly description: string;
}

/**
 * Tool configuration interface
 */
export interface ToolConfig {
    name: string;
    description: string;
    enabled: boolean;
}