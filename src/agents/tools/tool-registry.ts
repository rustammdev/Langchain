/**
 * Tool Registry - for managing all tools
 * This class registers and manages all available tools
 */

import type { Tool } from "@langchain/core/tools";
import type { IToolService, ToolConfig } from "./base/tool.interface.js";

// Tool implementations
import { TimeToolService } from "./implementations/time.tool.js";
import { ChromaSearchToolService } from "./implementations/chroma-search.tool.js";
import { DuckDuckGoSearchToolService, WikipediaSearchToolService } from "./implementations/web-search.tool.js";
import { FetchDataToolService } from "./implementations/fetch-data.tool.js";
import { CalculatorToolService } from "./implementations/calculator.tool.js";

/**
 * Tool Registry class - centralized management of all tools
 */
export class ToolRegistry {
    private toolServices: Map<string, IToolService> = new Map();
    private toolConfigs: Map<string, ToolConfig> = new Map();

    constructor() {
        this.initializeTools();
    }

    /**
     * Register all tools
     */
    private initializeTools(): void {
        console.log("🔧 Registering tools...");

        // Register tool services
        const toolServices = [
            new TimeToolService(),
            new ChromaSearchToolService(),
            new DuckDuckGoSearchToolService(),
            new WikipediaSearchToolService(),
            new FetchDataToolService(),
            new CalculatorToolService(),
        ];

        // Add each tool to registry
        toolServices.forEach(service => {
            this.toolServices.set(service.name, service);

            // Default configuration
            this.toolConfigs.set(service.name, {
                name: service.name,
                description: service.description,
                enabled: true
            });

            console.log(`✅ Tool registered: ${service.name}`);
        });

        console.log(`🎉 Total ${this.toolServices.size} tools registered`);
    }

    /**
     * Get all enabled tools
     * @returns List of tools
     */
    getEnabledTools(): Tool[] {
        const enabledTools: Tool[] = [];

        for (const [name, service] of this.toolServices) {
            const config = this.toolConfigs.get(name);

            if (config?.enabled) {
                try {
                    const tool = service.createTool() as Tool;
                    enabledTools.push(tool);
                    console.log(`🔧 Tool enabled: ${name}`);
                } catch (error) {
                    console.error(`❌ Error creating tool (${name}):`, error);
                }
            } else {
                console.log(`⏸️ Tool disabled: ${name}`);
            }
        }

        console.log(`🎯 Total ${enabledTools.length} tools enabled`);
        return enabledTools;
    }

    /**
     * Get specific tools
     * @param toolNames List of tool names
     * @returns List of tools
     */
    getSpecificTools(toolNames: string[]): Tool[] {
        const tools: Tool[] = [];

        for (const name of toolNames) {
            const service = this.toolServices.get(name);
            const config = this.toolConfigs.get(name);

            if (service && config?.enabled) {
                try {
                    const tool = service.createTool() as Tool;
                    tools.push(tool);
                    console.log(`🔧 Tool added: ${name}`);
                } catch (error) {
                    console.error(`❌ Error creating tool (${name}):`, error);
                }
            } else if (!service) {
                console.warn(`⚠️ Tool not found: ${name}`);
            } else {
                console.log(`⏸️ Tool disabled: ${name}`);
            }
        }

        return tools;
    }

    /**
     * Enable/disable tool
     * @param toolName Tool name
     * @param enabled Enable/disable
     */
    setToolEnabled(toolName: string, enabled: boolean): void {
        const config = this.toolConfigs.get(toolName);

        if (config) {
            config.enabled = enabled;
            console.log(`🔄 Tool status changed: ${toolName} -> ${enabled ? 'enabled' : 'disabled'}`);
        } else {
            console.warn(`⚠️ Tool not found: ${toolName}`);
        }
    }

    /**
     * Get all tool configurations
     * @returns Tool configurations
     */
    getAllToolConfigs(): ToolConfig[] {
        return Array.from(this.toolConfigs.values());
    }

    /**
     * Check if tool exists
     * @param toolName Tool name
     * @returns Whether tool exists
     */
    hasToolService(toolName: string): boolean {
        return this.toolServices.has(toolName);
    }
}