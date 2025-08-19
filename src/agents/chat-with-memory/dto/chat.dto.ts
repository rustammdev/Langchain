/**
 * Chat DTO - Validation schemas for HTTP requests
 * 
 * This file contains Zod schemas for chat and agent requests.
 * All incoming data is validated through these schemas.
 */

import { z } from "zod";

/**
 * Schema for simple chat request
 */
export const ChatRequestSchema = z.object({
  userId: z.string().min(1, "UserId cannot be empty"),
  input: z.string().min(1, "Message cannot be empty"),
});

/**
 * Schema for agent request (with additional parameters)
 */
export const AgentRequestSchema = z.object({
  userId: z.string().min(1, "UserId cannot be empty"),
  input: z.string().min(1, "Message cannot be empty"),
  agentType: z.enum(["openai_tools", "react"]).optional(),
  enabledTools: z.array(z.string()).optional(),
});

/**
 * Schema for changing tool state
 */
export const ToggleToolSchema = z.object({
  enabled: z.boolean(),
});

/**
 * Automatic type inference from schemas
 */
export type ChatRequest = z.infer<typeof ChatRequestSchema>;
export type AgentRequest = z.infer<typeof AgentRequestSchema>;
export type ToggleToolRequest = z.infer<typeof ToggleToolSchema>;
