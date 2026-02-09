/**
 * Hook Input Normalization
 *
 * Handles snake_case -> camelCase field mapping for Claude Code hook inputs.
 * Claude Code sends snake_case fields: tool_name, tool_input, tool_response,
 * session_id, cwd, hook_event_name. This module normalizes them to camelCase
 * with snake_case-first fallback.
 *
 * Uses Zod for structural validation to catch malformed inputs early.
 */

import { z } from 'zod';
import type { HookInput } from './bridge.js';

// --- Zod schemas for hook input validation ---

/** Schema for the common hook input structure (supports both snake_case and camelCase) */
const HookInputSchema = z.object({
  // snake_case fields from Claude Code
  tool_name: z.string().optional(),
  tool_input: z.unknown().optional(),
  tool_response: z.unknown().optional(),
  session_id: z.string().optional(),
  cwd: z.string().optional(),
  hook_event_name: z.string().optional(),

  // camelCase fields (fallback / already normalized)
  toolName: z.string().optional(),
  toolInput: z.unknown().optional(),
  toolOutput: z.unknown().optional(),
  toolResponse: z.unknown().optional(),
  sessionId: z.string().optional(),
  directory: z.string().optional(),
  hookEventName: z.string().optional(),

  // Fields that are the same in both conventions
  prompt: z.string().optional(),
  message: z.object({ content: z.string().optional() }).optional(),
  parts: z.array(z.object({ type: z.string(), text: z.string().optional() })).optional(),

  // Stop hook fields
  stop_reason: z.string().optional(),
  stopReason: z.string().optional(),
  user_requested: z.boolean().optional(),
  userRequested: z.boolean().optional(),
}).passthrough();

/**
 * Raw hook input as received from Claude Code (snake_case fields)
 */
interface RawHookInput {
  // snake_case fields from Claude Code
  tool_name?: string;
  tool_input?: unknown;
  tool_response?: unknown;
  session_id?: string;
  cwd?: string;
  hook_event_name?: string;

  // camelCase fields (fallback / already normalized)
  toolName?: string;
  toolInput?: unknown;
  toolOutput?: unknown;
  toolResponse?: unknown;
  sessionId?: string;
  directory?: string;
  hookEventName?: string;

  // Fields that are the same in both conventions
  prompt?: string;
  message?: { content?: string };
  parts?: Array<{ type: string; text?: string }>;

  // Allow other fields to pass through
  [key: string]: unknown;
}

/**
 * Normalize hook input from Claude Code's snake_case format to the
 * camelCase HookInput interface used internally.
 *
 * Validates the input structure with Zod, then maps snake_case to camelCase.
 * Always reads snake_case first with camelCase fallback, per the
 * project convention documented in MEMORY.md.
 */
export function normalizeHookInput(raw: unknown): HookInput {
  if (typeof raw !== 'object' || raw === null) {
    return {};
  }

  // Validate with Zod - use safeParse so malformed input doesn't throw
  const parsed = HookInputSchema.safeParse(raw);
  if (!parsed.success) {
    // Log validation issues but don't block - fall through to best-effort mapping
    console.error('[bridge-normalize] Zod validation warning:', parsed.error.issues.map(i => i.message).join(', '));
  }

  const input = (parsed.success ? parsed.data : raw) as RawHookInput;

  return {
    sessionId: input.session_id ?? input.sessionId,
    toolName: input.tool_name ?? input.toolName,
    toolInput: input.tool_input ?? input.toolInput,
    // tool_response maps to toolOutput for backward compatibility
    toolOutput: input.tool_response ?? input.toolOutput ?? input.toolResponse,
    directory: input.cwd ?? input.directory,
    prompt: input.prompt,
    message: input.message,
    parts: input.parts,
    // Pass through any extra fields that specific hooks may need
    ...passthrough(input),
  } as HookInput;
}

/**
 * Collect fields that don't have a normalization mapping,
 * so hook-specific fields (e.g. stop_reason, agent_id) pass through unchanged.
 */
function passthrough(input: RawHookInput): Record<string, unknown> {
  const MAPPED_KEYS = new Set([
    'tool_name', 'toolName',
    'tool_input', 'toolInput',
    'tool_response', 'toolOutput', 'toolResponse',
    'session_id', 'sessionId',
    'cwd', 'directory',
    'hook_event_name', 'hookEventName',
    'prompt', 'message', 'parts',
  ]);

  const extra: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (!MAPPED_KEYS.has(key) && value !== undefined) {
      extra[key] = value;
    }
  }
  return extra;
}
