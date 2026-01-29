#!/usr/bin/env node
// OMC Stop Continuation Hook (Node.js)
// Checks for incomplete todos and injects continuation prompt
// Cross-platform: Windows, macOS, Linux

import { readdirSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

/**
 * Validates session ID to prevent path traversal attacks.
 * @param {string} sessionId
 * @returns {boolean}
 */
function isValidSessionId(sessionId) {
  if (!sessionId || typeof sessionId !== 'string') return false;
  return /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,255}$/.test(sessionId);
}

/**
 * Count incomplete tasks in the new Task system.
 *
 * SYNC NOTICE: This function is intentionally duplicated across:
 * - templates/hooks/persistent-mode.mjs
 * - templates/hooks/stop-continuation.mjs
 * - src/hooks/todo-continuation/index.ts (as checkIncompleteTasks)
 *
 * Templates cannot import shared modules (they're standalone scripts).
 * When modifying this logic, update ALL THREE files to maintain consistency.
 */
function countIncompleteTasks(sessionId) {
  if (!sessionId || !isValidSessionId(sessionId)) return 0;
  const taskDir = join(homedir(), '.claude', 'tasks', sessionId);
  if (!existsSync(taskDir)) return 0;

  let count = 0;
  try {
    const files = readdirSync(taskDir).filter(f => f.endsWith('.json') && f !== '.lock');
    for (const file of files) {
      try {
        const content = readFileSync(join(taskDir, file), 'utf-8');
        const task = JSON.parse(content);
        // Match TypeScript isTaskIncomplete(): only pending/in_progress are incomplete
        // 'deleted' and 'completed' are both treated as done
        if (task.status === 'pending' || task.status === 'in_progress') count++;
      } catch { /* skip invalid files */ }
    }
  } catch { /* dir read error */ }
  return count;
}

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
    // Read stdin to get sessionId and consume it
    const input = await readStdin();

    // Parse sessionId from input
    let data = {};
    try {
      data = JSON.parse(input);
    } catch { /* invalid JSON - continue with empty data */ }

    const sessionId = data.sessionId || data.session_id || '';

    // Count incomplete Task system tasks
    const taskCount = countIncompleteTasks(sessionId);

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

    // Combine both counts
    const totalIncomplete = taskCount + incompleteCount;

    if (totalIncomplete > 0) {
      const sourceLabel = taskCount > 0 ? 'Task' : 'todo';
      const reason = `[SYSTEM REMINDER - ${sourceLabel.toUpperCase()} CONTINUATION]

Incomplete ${sourceLabel}s remain (${totalIncomplete} remaining). Continue working on the next pending ${sourceLabel}.

- Proceed without asking for permission
- Mark each ${sourceLabel} complete when finished
- Do not stop until all ${sourceLabel}s are done`;

      console.log(JSON.stringify({ decision: "block", reason }));
      return;
    }

    // No incomplete tasks or todos - allow stop
    console.log(JSON.stringify({ continue: true }));
  } catch (error) {
    // On any error, allow continuation
    console.log(JSON.stringify({ continue: true }));
  }
}

main();
