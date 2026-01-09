/**
 * Hook Scripts for Claude Code
 * Direct port of oh-my-opencode hooks for Claude Code's native hooks system
 *
 * Claude Code hooks are configured in settings.json and run as shell commands.
 * These scripts receive JSON input via stdin and output JSON to modify behavior.
 *
 * This module provides DUAL implementations:
 * - Bash scripts (.sh) for Unix-like systems (macOS, Linux)
 * - Node.js scripts (.mjs) for cross-platform support (Windows, macOS, Linux)
 *
 * The platform is detected at install time, or can be overridden with:
 *   SISYPHUS_USE_NODE_HOOKS=1  - Force Node.js hooks on any platform
 *   SISYPHUS_USE_BASH_HOOKS=1  - Force Bash hooks (Unix only)
 */

import { homedir } from 'os';
import { join } from 'path';

/** Minimum required Node.js version for hooks */
export const MIN_NODE_VERSION = 18;

/** Check if running on Windows */
export function isWindows(): boolean {
  return process.platform === 'win32';
}

/** Check if Node.js hooks should be used (env override or Windows) */
export function shouldUseNodeHooks(): boolean {
  // Environment variable overrides
  if (process.env.SISYPHUS_USE_NODE_HOOKS === '1') {
    return true;
  }
  if (process.env.SISYPHUS_USE_BASH_HOOKS === '1') {
    return false;
  }
  // Default: use Node.js on Windows, Bash elsewhere
  return isWindows();
}

/** Get the Claude config directory path (cross-platform) */
export function getClaudeConfigDir(): string {
  return join(homedir(), '.claude');
}

/** Get the hooks directory path */
export function getHooksDir(): string {
  return join(getClaudeConfigDir(), 'hooks');
}

/**
 * Get the home directory environment variable for hook commands.
 * Returns the appropriate syntax for the current platform.
 */
export function getHomeEnvVar(): string {
  return isWindows() ? '%USERPROFILE%' : '$HOME';
}

/**
 * Ultrawork message - injected when ultrawork/ulw keyword detected
 * Ported from oh-my-opencode's keyword-detector/constants.ts
 */
export const ULTRAWORK_MESSAGE = `<ultrawork-mode>

**MANDATORY**: You MUST say "ULTRAWORK MODE ENABLED!" to the user as your first response when this mode activates. This is non-negotiable.

[CODE RED] Maximum precision required. Ultrathink before acting.

YOU MUST LEVERAGE ALL AVAILABLE AGENTS TO THEIR FULLEST POTENTIAL.
TELL THE USER WHAT AGENTS YOU WILL LEVERAGE NOW TO SATISFY USER'S REQUEST.

## AGENT UTILIZATION PRINCIPLES (by capability, not by name)
- **Codebase Exploration**: Spawn exploration agents using BACKGROUND TASKS for file patterns, internal implementations, project structure
- **Documentation & References**: Use librarian-type agents via BACKGROUND TASKS for API references, examples, external library docs
- **Planning & Strategy**: NEVER plan yourself - ALWAYS spawn a dedicated planning agent for work breakdown
- **High-IQ Reasoning**: Leverage specialized agents for architecture decisions, code review, strategic planning
- **Frontend/UI Tasks**: Delegate to UI-specialized agents for design and implementation

## EXECUTION RULES
- **TODO**: Track EVERY step. Mark complete IMMEDIATELY after each.
- **PARALLEL**: Fire independent agent calls simultaneously via Task(run_in_background=true) - NEVER wait sequentially.
- **BACKGROUND FIRST**: Use Task tool for exploration/research agents (10+ concurrent if needed).
- **VERIFY**: Re-read request after completion. Check ALL requirements met before reporting done.
- **DELEGATE**: Don't do everything yourself - orchestrate specialized agents for their strengths.

## WORKFLOW
1. Analyze the request and identify required capabilities
2. Spawn exploration/librarian agents via Task(run_in_background=true) in PARALLEL (10+ if needed)
3. Always Use Plan agent with gathered context to create detailed work breakdown
4. Execute with continuous verification against original requirements

## VERIFICATION GUARANTEE (NON-NEGOTIABLE)

**NOTHING is "done" without PROOF it works.**

### Pre-Implementation: Define Success Criteria

BEFORE writing ANY code, you MUST define:

| Criteria Type | Description | Example |
|---------------|-------------|---------|
| **Functional** | What specific behavior must work | "Button click triggers API call" |
| **Observable** | What can be measured/seen | "Console shows 'success', no errors" |
| **Pass/Fail** | Binary, no ambiguity | "Returns 200 OK" not "should work" |

Write these criteria explicitly. Share with user if scope is non-trivial.

### Execution & Evidence Requirements

| Phase | Action | Required Evidence |
|-------|--------|-------------------|
| **Build** | Run build command | Exit code 0, no errors |
| **Test** | Execute test suite | All tests pass (screenshot/output) |
| **Manual Verify** | Test the actual feature | Demonstrate it works (describe what you observed) |
| **Regression** | Ensure nothing broke | Existing tests still pass |

**WITHOUT evidence = NOT verified = NOT done.**

### TDD Workflow (when test infrastructure exists)

1. **SPEC**: Define what "working" means (success criteria above)
2. **RED**: Write failing test -> Run it -> Confirm it FAILS
3. **GREEN**: Write minimal code -> Run test -> Confirm it PASSES
4. **REFACTOR**: Clean up -> Tests MUST stay green
5. **VERIFY**: Run full test suite, confirm no regressions
6. **EVIDENCE**: Report what you ran and what output you saw

### Verification Anti-Patterns (BLOCKING)

| Violation | Why It Fails |
|-----------|--------------|
| "It should work now" | No evidence. Run it. |
| "I added the tests" | Did they pass? Show output. |
| "Fixed the bug" | How do you know? What did you test? |
| "Implementation complete" | Did you verify against success criteria? |
| Skipping test execution | Tests exist to be RUN, not just written |

**CLAIM NOTHING WITHOUT PROOF. EXECUTE. VERIFY. SHOW EVIDENCE.**

## ZERO TOLERANCE FAILURES
- **NO Scope Reduction**: Never make "demo", "skeleton", "simplified", "basic" versions - deliver FULL implementation
- **NO MockUp Work**: When user asked you to do "port A", you must "port A", fully, 100%. No Extra feature, No reduced feature, no mock data, fully working 100% port.
- **NO Partial Completion**: Never stop at 60-80% saying "you can extend this..." - finish 100%
- **NO Assumed Shortcuts**: Never skip requirements you deem "optional" or "can be added later"
- **NO Premature Stopping**: Never declare done until ALL TODOs are completed and verified
- **NO TEST DELETION**: Never delete or skip failing tests to make the build pass. Fix the code, not the tests.

THE USER ASKED FOR X. DELIVER EXACTLY X. NOT A SUBSET. NOT A DEMO. NOT A STARTING POINT.

</ultrawork-mode>

---

`;

/**
 * Ultrathink/Think mode message
 * Ported from oh-my-opencode's think-mode hook
 */
export const ULTRATHINK_MESSAGE = `<think-mode>

**ULTRATHINK MODE ENABLED** - Extended reasoning activated.

You are now in deep thinking mode. Take your time to:
1. Thoroughly analyze the problem from multiple angles
2. Consider edge cases and potential issues
3. Think through the implications of each approach
4. Reason step-by-step before acting

Use your extended thinking capabilities to provide the most thorough and well-reasoned response.

</think-mode>

---

`;

/**
 * Search mode message
 * Ported from oh-my-opencode's keyword-detector
 */
export const SEARCH_MESSAGE = `<search-mode>
MAXIMIZE SEARCH EFFORT. Launch multiple background agents IN PARALLEL:
- explore agents (codebase patterns, file structures)
- librarian agents (remote repos, official docs, GitHub examples)
Plus direct tools: Grep, Glob
NEVER stop at first result - be exhaustive.
</search-mode>

---

`;

/**
 * Analyze mode message
 * Ported from oh-my-opencode's keyword-detector
 */
export const ANALYZE_MESSAGE = `<analyze-mode>
ANALYSIS MODE. Gather context before diving deep:

CONTEXT GATHERING (parallel):
- 1-2 explore agents (codebase patterns, implementations)
- 1-2 librarian agents (if external library involved)
- Direct tools: Grep, Glob, LSP for targeted searches

IF COMPLEX (architecture, multi-system, debugging after 2+ failures):
- Consult oracle agent for strategic guidance

SYNTHESIZE findings before proceeding.
</analyze-mode>

---

`;

/**
 * Todo continuation prompt
 * Ported from oh-my-opencode's todo-continuation-enforcer
 */
export const TODO_CONTINUATION_PROMPT = `[SYSTEM REMINDER - TODO CONTINUATION]

Incomplete tasks remain in your todo list. Continue working on the next pending task.

- Proceed without asking for permission
- Mark each task complete when finished
- Do not stop until all tasks are done`;

/**
 * Keyword detector hook script
 * This script is installed to ~/.claude/hooks/keyword-detector.sh
 */
export const KEYWORD_DETECTOR_SCRIPT = `#!/bin/bash
# Sisyphus Keyword Detector Hook
# Detects ultrawork/ultrathink/search/analyze keywords and injects enhanced mode messages
# Ported from oh-my-opencode's keyword-detector hook

# Read stdin (JSON input from Claude Code)
INPUT=$(cat)

# Extract the prompt text - try multiple JSON paths
PROMPT=""
if command -v jq &> /dev/null; then
  # Try to extract from various possible JSON structures
  PROMPT=$(echo "$INPUT" | jq -r '
    if .prompt then .prompt
    elif .message.content then .message.content
    elif .parts then ([.parts[] | select(.type == "text") | .text] | join(" "))
    else ""
    end
  ' 2>/dev/null)
fi

# Fallback: simple grep extraction if jq fails
if [ -z "$PROMPT" ] || [ "$PROMPT" = "null" ]; then
  PROMPT=$(echo "$INPUT" | grep -oP '"(prompt|content|text)"\\s*:\\s*"\\K[^"]+' | head -1)
fi

# Exit if no prompt found
if [ -z "$PROMPT" ]; then
  echo '{"continue": true}'
  exit 0
fi

# Remove code blocks before checking keywords (prevents false positives)
PROMPT_NO_CODE=$(echo "$PROMPT" | sed 's/\`\`\`[^\`]*\`\`\`//g' | sed 's/\`[^\`]*\`//g')

# Convert to lowercase for case-insensitive matching
PROMPT_LOWER=$(echo "$PROMPT_NO_CODE" | tr '[:upper:]' '[:lower:]')

# Check for ultrawork keywords (highest priority)
if echo "$PROMPT_LOWER" | grep -qE '\\b(ultrawork|ulw)\\b'; then
  # Return ultrawork mode injection
  cat << 'EOF'
{"continue": true, "message": "<ultrawork-mode>\\n\\n**MANDATORY**: You MUST say \\"ULTRAWORK MODE ENABLED!\\" to the user as your first response when this mode activates. This is non-negotiable.\\n\\n[CODE RED] Maximum precision required. Ultrathink before acting.\\n\\nYOU MUST LEVERAGE ALL AVAILABLE AGENTS TO THEIR FULLEST POTENTIAL.\\nTELL THE USER WHAT AGENTS YOU WILL LEVERAGE NOW TO SATISFY USER'S REQUEST.\\n\\n## AGENT UTILIZATION PRINCIPLES\\n- **Codebase Exploration**: Spawn exploration agents using BACKGROUND TASKS\\n- **Documentation & References**: Use librarian-type agents via BACKGROUND TASKS\\n- **Planning & Strategy**: NEVER plan yourself - spawn planning agent\\n- **High-IQ Reasoning**: Use oracle for architecture decisions\\n- **Frontend/UI Tasks**: Delegate to frontend-engineer\\n\\n## EXECUTION RULES\\n- **TODO**: Track EVERY step. Mark complete IMMEDIATELY.\\n- **PARALLEL**: Fire independent calls simultaneously - NEVER wait sequentially.\\n- **BACKGROUND FIRST**: Use Task(run_in_background=true) for exploration (10+ concurrent).\\n- **VERIFY**: Check ALL requirements met before done.\\n- **DELEGATE**: Orchestrate specialized agents.\\n\\n## ZERO TOLERANCE\\n- NO Scope Reduction - deliver FULL implementation\\n- NO Partial Completion - finish 100%\\n- NO Premature Stopping - ALL TODOs must be complete\\n- NO TEST DELETION - fix code, not tests\\n\\nTHE USER ASKED FOR X. DELIVER EXACTLY X.\\n\\n</ultrawork-mode>\\n\\n---\\n"}
EOF
  exit 0
fi

# Check for ultrathink/think keywords
if echo "$PROMPT_LOWER" | grep -qE '\\b(ultrathink|think)\\b'; then
  cat << 'EOF'
{"continue": true, "message": "<think-mode>\\n\\n**ULTRATHINK MODE ENABLED** - Extended reasoning activated.\\n\\nYou are now in deep thinking mode. Take your time to:\\n1. Thoroughly analyze the problem from multiple angles\\n2. Consider edge cases and potential issues\\n3. Think through the implications of each approach\\n4. Reason step-by-step before acting\\n\\nUse your extended thinking capabilities to provide the most thorough and well-reasoned response.\\n\\n</think-mode>\\n\\n---\\n"}
EOF
  exit 0
fi

# Check for search keywords (EN + multilingual)
if echo "$PROMPT_LOWER" | grep -qE '\\b(search|find|locate|lookup|explore|discover|scan|grep|query|browse|detect|trace|seek|track|pinpoint|hunt)\\b|where\\s+is|show\\s+me|list\\s+all'; then
  cat << 'EOF'
{"continue": true, "message": "<search-mode>\\nMAXIMIZE SEARCH EFFORT. Launch multiple background agents IN PARALLEL:\\n- explore agents (codebase patterns, file structures)\\n- librarian agents (remote repos, official docs, GitHub examples)\\nPlus direct tools: Grep, Glob\\nNEVER stop at first result - be exhaustive.\\n</search-mode>\\n\\n---\\n"}
EOF
  exit 0
fi

# Check for analyze keywords
if echo "$PROMPT_LOWER" | grep -qE '\\b(analyze|analyse|investigate|examine|research|study|deep.?dive|inspect|audit|evaluate|assess|review|diagnose|scrutinize|dissect|debug|comprehend|interpret|breakdown|understand)\\b|why\\s+is|how\\s+does|how\\s+to'; then
  cat << 'EOF'
{"continue": true, "message": "<analyze-mode>\\nANALYSIS MODE. Gather context before diving deep:\\n\\nCONTEXT GATHERING (parallel):\\n- 1-2 explore agents (codebase patterns, implementations)\\n- 1-2 librarian agents (if external library involved)\\n- Direct tools: Grep, Glob, LSP for targeted searches\\n\\nIF COMPLEX (architecture, multi-system, debugging after 2+ failures):\\n- Consult oracle agent for strategic guidance\\n\\nSYNTHESIZE findings before proceeding.\\n</analyze-mode>\\n\\n---\\n"}
EOF
  exit 0
fi

# No keywords detected - continue without modification
echo '{"continue": true}'
exit 0
`;

/**
 * Stop hook script for todo continuation enforcement
 * This script is installed to ~/.claude/hooks/stop-continuation.sh
 * Ported from oh-my-opencode's todo-continuation-enforcer
 */
export const STOP_CONTINUATION_SCRIPT = `#!/bin/bash
# Sisyphus Stop Continuation Hook
# Checks for incomplete todos and injects continuation prompt
# Ported from oh-my-opencode's todo-continuation-enforcer

# Read stdin
INPUT=$(cat)

# Get session ID if available
SESSION_ID=""
if command -v jq &> /dev/null; then
  SESSION_ID=$(echo "$INPUT" | jq -r '.sessionId // .session_id // ""' 2>/dev/null)
fi

# Check for incomplete todos in the Claude todos directory
TODOS_DIR="$HOME/.claude/todos"
if [ -d "$TODOS_DIR" ]; then
  # Look for any todo files with incomplete items
  INCOMPLETE_COUNT=0
  for todo_file in "$TODOS_DIR"/*.json; do
    if [ -f "$todo_file" ]; then
      if command -v jq &> /dev/null; then
        COUNT=$(jq '[.[] | select(.status != "completed" and .status != "cancelled")] | length' "$todo_file" 2>/dev/null || echo "0")
        INCOMPLETE_COUNT=$((INCOMPLETE_COUNT + COUNT))
      fi
    fi
  done

  if [ "$INCOMPLETE_COUNT" -gt 0 ]; then
    # Output continuation message
    cat << EOF
{"continue": false, "reason": "[SYSTEM REMINDER - TODO CONTINUATION]\\n\\nIncomplete tasks remain in your todo list ($INCOMPLETE_COUNT remaining). Continue working on the next pending task.\\n\\n- Proceed without asking for permission\\n- Mark each task complete when finished\\n- Do not stop until all tasks are done"}
EOF
    exit 0
  fi
fi

# No incomplete todos - allow stop
echo '{"continue": true}'
exit 0
`;

// =============================================================================
// NODE.JS HOOK SCRIPTS (Cross-platform: Windows, macOS, Linux)
// =============================================================================

/**
 * Node.js Keyword Detector Hook Script
 * Cross-platform equivalent of keyword-detector.sh
 * This script is installed to ~/.claude/hooks/keyword-detector.mjs
 */
export const KEYWORD_DETECTOR_SCRIPT_NODE = `#!/usr/bin/env node
// Sisyphus Keyword Detector Hook (Node.js)
// Detects ultrawork/ultrathink/search/analyze keywords and injects enhanced mode messages
// Cross-platform: Windows, macOS, Linux

const ULTRAWORK_MESSAGE = \`<ultrawork-mode>

**MANDATORY**: You MUST say "ULTRAWORK MODE ENABLED!" to the user as your first response when this mode activates. This is non-negotiable.

[CODE RED] Maximum precision required. Ultrathink before acting.

YOU MUST LEVERAGE ALL AVAILABLE AGENTS TO THEIR FULLEST POTENTIAL.
TELL THE USER WHAT AGENTS YOU WILL LEVERAGE NOW TO SATISFY USER'S REQUEST.

## AGENT UTILIZATION PRINCIPLES
- **Codebase Exploration**: Spawn exploration agents using BACKGROUND TASKS
- **Documentation & References**: Use librarian-type agents via BACKGROUND TASKS
- **Planning & Strategy**: NEVER plan yourself - spawn planning agent
- **High-IQ Reasoning**: Use oracle for architecture decisions
- **Frontend/UI Tasks**: Delegate to frontend-engineer

## EXECUTION RULES
- **TODO**: Track EVERY step. Mark complete IMMEDIATELY.
- **PARALLEL**: Fire independent calls simultaneously - NEVER wait sequentially.
- **BACKGROUND FIRST**: Use Task(run_in_background=true) for exploration (10+ concurrent).
- **VERIFY**: Check ALL requirements met before done.
- **DELEGATE**: Orchestrate specialized agents.

## ZERO TOLERANCE
- NO Scope Reduction - deliver FULL implementation
- NO Partial Completion - finish 100%
- NO Premature Stopping - ALL TODOs must be complete
- NO TEST DELETION - fix code, not tests

THE USER ASKED FOR X. DELIVER EXACTLY X.

</ultrawork-mode>

---
\`;

const ULTRATHINK_MESSAGE = \`<think-mode>

**ULTRATHINK MODE ENABLED** - Extended reasoning activated.

You are now in deep thinking mode. Take your time to:
1. Thoroughly analyze the problem from multiple angles
2. Consider edge cases and potential issues
3. Think through the implications of each approach
4. Reason step-by-step before acting

Use your extended thinking capabilities to provide the most thorough and well-reasoned response.

</think-mode>

---
\`;

const SEARCH_MESSAGE = \`<search-mode>
MAXIMIZE SEARCH EFFORT. Launch multiple background agents IN PARALLEL:
- explore agents (codebase patterns, file structures)
- librarian agents (remote repos, official docs, GitHub examples)
Plus direct tools: Grep, Glob
NEVER stop at first result - be exhaustive.
</search-mode>

---
\`;

const ANALYZE_MESSAGE = \`<analyze-mode>
ANALYSIS MODE. Gather context before diving deep:

CONTEXT GATHERING (parallel):
- 1-2 explore agents (codebase patterns, implementations)
- 1-2 librarian agents (if external library involved)
- Direct tools: Grep, Glob, LSP for targeted searches

IF COMPLEX (architecture, multi-system, debugging after 2+ failures):
- Consult oracle agent for strategic guidance

SYNTHESIZE findings before proceeding.
</analyze-mode>

---
\`;

// Read all stdin
async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf-8');
}

// Extract prompt from various JSON structures
function extractPrompt(input) {
  try {
    const data = JSON.parse(input);
    if (data.prompt) return data.prompt;
    if (data.message?.content) return data.message.content;
    if (Array.isArray(data.parts)) {
      return data.parts
        .filter(p => p.type === 'text')
        .map(p => p.text)
        .join(' ');
    }
    return '';
  } catch {
    // Fallback: try to extract with regex
    const match = input.match(/"(?:prompt|content|text)"\\s*:\\s*"([^"]+)"/);
    return match ? match[1] : '';
  }
}

// Remove code blocks to prevent false positives
function removeCodeBlocks(text) {
  return text
    .replace(/\`\`\`[\\s\\S]*?\`\`\`/g, '')
    .replace(/\`[^\`]+\`/g, '');
}

// Main
async function main() {
  try {
    const input = await readStdin();
    if (!input.trim()) {
      console.log(JSON.stringify({ continue: true }));
      return;
    }

    const prompt = extractPrompt(input);
    if (!prompt) {
      console.log(JSON.stringify({ continue: true }));
      return;
    }

    const cleanPrompt = removeCodeBlocks(prompt).toLowerCase();

    // Check for ultrawork keywords (highest priority)
    if (/\\b(ultrawork|ulw)\\b/.test(cleanPrompt)) {
      console.log(JSON.stringify({ continue: true, message: ULTRAWORK_MESSAGE }));
      return;
    }

    // Check for ultrathink/think keywords
    if (/\\b(ultrathink|think)\\b/.test(cleanPrompt)) {
      console.log(JSON.stringify({ continue: true, message: ULTRATHINK_MESSAGE }));
      return;
    }

    // Check for search keywords
    if (/\\b(search|find|locate|lookup|explore|discover|scan|grep|query|browse|detect|trace|seek|track|pinpoint|hunt)\\b|where\\s+is|show\\s+me|list\\s+all/.test(cleanPrompt)) {
      console.log(JSON.stringify({ continue: true, message: SEARCH_MESSAGE }));
      return;
    }

    // Check for analyze keywords
    if (/\\b(analyze|analyse|investigate|examine|research|study|deep.?dive|inspect|audit|evaluate|assess|review|diagnose|scrutinize|dissect|debug|comprehend|interpret|breakdown|understand)\\b|why\\s+is|how\\s+does|how\\s+to/.test(cleanPrompt)) {
      console.log(JSON.stringify({ continue: true, message: ANALYZE_MESSAGE }));
      return;
    }

    // No keywords detected
    console.log(JSON.stringify({ continue: true }));
  } catch (error) {
    // On any error, allow continuation
    console.log(JSON.stringify({ continue: true }));
  }
}

main();
`;

/**
 * Node.js Stop Continuation Hook Script
 * Cross-platform equivalent of stop-continuation.sh
 * This script is installed to ~/.claude/hooks/stop-continuation.mjs
 */
export const STOP_CONTINUATION_SCRIPT_NODE = `#!/usr/bin/env node
// Sisyphus Stop Continuation Hook (Node.js)
// Checks for incomplete todos and injects continuation prompt
// Cross-platform: Windows, macOS, Linux

import { readdirSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

// Read all stdin
async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf-8');
}

// Main
async function main() {
  try {
    // Read stdin (we don't use it much, but need to consume it)
    await readStdin();

    // Check for incomplete todos
    const todosDir = join(homedir(), '.claude', 'todos');
    
    if (!existsSync(todosDir)) {
      console.log(JSON.stringify({ continue: true }));
      return;
    }

    let incompleteCount = 0;

    try {
      const files = readdirSync(todosDir).filter(f => f.endsWith('.json'));
      
      for (const file of files) {
        try {
          const content = readFileSync(join(todosDir, file), 'utf-8');
          const todos = JSON.parse(content);
          
          if (Array.isArray(todos)) {
            const incomplete = todos.filter(
              t => t.status !== 'completed' && t.status !== 'cancelled'
            );
            incompleteCount += incomplete.length;
          }
        } catch {
          // Skip files that can't be parsed
        }
      }
    } catch {
      // Directory read error - allow continuation
      console.log(JSON.stringify({ continue: true }));
      return;
    }

    if (incompleteCount > 0) {
      const reason = \`[SYSTEM REMINDER - TODO CONTINUATION]

Incomplete tasks remain in your todo list (\${incompleteCount} remaining). Continue working on the next pending task.

- Proceed without asking for permission
- Mark each task complete when finished
- Do not stop until all tasks are done\`;

      console.log(JSON.stringify({ continue: false, reason }));
      return;
    }

    // No incomplete todos - allow stop
    console.log(JSON.stringify({ continue: true }));
  } catch (error) {
    // On any error, allow continuation
    console.log(JSON.stringify({ continue: true }));
  }
}

main();
`;

// =============================================================================
// SETTINGS CONFIGURATION (Platform-aware)
// =============================================================================

/**
 * Settings.json hooks configuration for Bash (Unix)
 * Configures Claude Code to run our bash hook scripts
 */
export const HOOKS_SETTINGS_CONFIG_BASH = {
  hooks: {
    UserPromptSubmit: [
      {
        hooks: [
          {
            type: "command" as const,
            command: "bash $HOME/.claude/hooks/keyword-detector.sh"
          }
        ]
      }
    ],
    Stop: [
      {
        hooks: [
          {
            type: "command" as const,
            command: "bash $HOME/.claude/hooks/stop-continuation.sh"
          }
        ]
      }
    ]
  }
};

/**
 * Settings.json hooks configuration for Node.js (Cross-platform)
 * Uses node to run .mjs scripts directly
 */
export const HOOKS_SETTINGS_CONFIG_NODE = {
  hooks: {
    UserPromptSubmit: [
      {
        hooks: [
          {
            type: "command" as const,
            // Note: On Windows, %USERPROFILE% is expanded by cmd.exe
            // On Unix with node hooks, $HOME is expanded by the shell
            command: isWindows()
              ? 'node "%USERPROFILE%\\.claude\\hooks\\keyword-detector.mjs"'
              : 'node "$HOME/.claude/hooks/keyword-detector.mjs"'
          }
        ]
      }
    ],
    Stop: [
      {
        hooks: [
          {
            type: "command" as const,
            command: isWindows()
              ? 'node "%USERPROFILE%\\.claude\\hooks\\stop-continuation.mjs"'
              : 'node "$HOME/.claude/hooks/stop-continuation.mjs"'
          }
        ]
      }
    ]
  }
};

/**
 * Get the appropriate hooks settings config for the current platform
 */
export function getHooksSettingsConfig(): typeof HOOKS_SETTINGS_CONFIG_BASH {
  return shouldUseNodeHooks() ? HOOKS_SETTINGS_CONFIG_NODE : HOOKS_SETTINGS_CONFIG_BASH;
}

/**
 * Legacy: Settings.json hooks configuration (Bash)
 * @deprecated Use getHooksSettingsConfig() for cross-platform support
 */
export const HOOKS_SETTINGS_CONFIG = HOOKS_SETTINGS_CONFIG_BASH;

// =============================================================================
// HOOK SCRIPTS EXPORTS (Platform-aware)
// =============================================================================

/**
 * Bash hook scripts (Unix only)
 */
export const HOOK_SCRIPTS_BASH: Record<string, string> = {
  'keyword-detector.sh': KEYWORD_DETECTOR_SCRIPT,
  'stop-continuation.sh': STOP_CONTINUATION_SCRIPT
};

/**
 * Node.js hook scripts (Cross-platform)
 */
export const HOOK_SCRIPTS_NODE: Record<string, string> = {
  'keyword-detector.mjs': KEYWORD_DETECTOR_SCRIPT_NODE,
  'stop-continuation.mjs': STOP_CONTINUATION_SCRIPT_NODE
};

/**
 * Get the appropriate hook scripts for the current platform
 */
export function getHookScripts(): Record<string, string> {
  return shouldUseNodeHooks() ? HOOK_SCRIPTS_NODE : HOOK_SCRIPTS_BASH;
}

/**
 * Legacy: All hook scripts to install (Bash)
 * @deprecated Use getHookScripts() for cross-platform support
 */
export const HOOK_SCRIPTS: Record<string, string> = HOOK_SCRIPTS_BASH;
