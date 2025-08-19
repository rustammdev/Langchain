/**
 * Calculator tool - for mathematical operations
 * This tool performs basic mathematical calculations
 */

import { tool } from "@langchain/core/tools";
import { z } from "zod";
import type { IToolService } from "../base/tool.interface.js";

export class CalculatorToolService implements IToolService {
    readonly name = "calculator";
    readonly description = "Performs mathematical operations (addition, subtraction, multiplication, division)";

    /**
     * Create calculator tool
     * @returns Tool object
     */
    createTool() {
        return tool(
            async (input: { operation: string; a: number; b: number }): Promise<string> => {
                try {
                    const { operation, a, b } = input;

                    console.log(`🧮 Mathematical operation: ${a} ${operation} ${b}`);

                    let result: number;

                    switch (operation) {
                        case '+':
                        case 'add':
                            result = a + b;
                            break;
                        case '-':
                        case 'subtract':
                            result = a - b;
                            break;
                        case '*':
                        case 'multiply':
                            result = a * b;
                            break;
                        case '/':
                        case 'divide':
                            if (b === 0) {
                                throw new Error("Division by zero is not allowed");
                            }
                            result = a / b;
                            break;
                        case '%':
                        case 'modulo':
                            if (b === 0) {
                                throw new Error("Division by zero is not allowed");
                            }
                            result = a % b;
                            break;
                        case '**':
                        case 'power':
                            result = Math.pow(a, b);
                            break;
                        default:
                            throw new Error(`Unknown operation: ${operation}. Supported operations: +, -, *, /, %, **`);
                    }

                    console.log(`✅ Result: ${result}`);

                    return `${a} ${operation} ${b} = ${result}`;

                } catch (error) {
                    console.error("❌ Error in mathematical operation:", error);
                    return `Error in mathematical operation: ${error instanceof Error ? error.message : 'Unknown error'}`;
                }
            },
            {
                name: this.name,
                description: this.description,
                schema: z.object({
                    operation: z.enum(['+', '-', '*', '/', '%', '**', 'add', 'subtract', 'multiply', 'divide', 'modulo', 'power']),
                    a: z.number(),
                    b: z.number()
                }),
            }
        );
    }
}