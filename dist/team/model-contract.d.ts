export type CliAgentType = 'claude' | 'codex' | 'gemini';
export interface CliAgentContract {
    agentType: CliAgentType;
    binary: string;
    installInstructions: string;
    buildLaunchArgs(model?: string, extraFlags?: string[]): string[];
    parseOutput(rawOutput: string): string;
    /** Whether this agent supports a prompt/headless mode that bypasses TUI input */
    supportsPromptMode?: boolean;
    /** CLI flag for prompt mode (e.g., '-p' for gemini) */
    promptModeFlag?: string;
}
export interface WorkerLaunchConfig {
    teamName: string;
    workerName: string;
    model?: string;
    cwd: string;
    extraFlags?: string[];
}
/**
 * Well-known prefixes where CLI binaries are typically installed.
 * Binaries outside these directories produce a warning but are not blocked,
 * supporting custom user setups while maintaining audit visibility.
 *
 * Extend via `OMC_TRUSTED_CLI_DIRS` (colon-separated) for non-standard layouts.
 */
declare function getTrustedPrefixes(): string[];
/**
 * Resolve a CLI binary name to its absolute filesystem path with security
 * validation. The result is cached for the lifetime of this process so that
 * subsequent calls are deterministic (PATH is only consulted once per binary).
 *
 * Security guarantees:
 *  - Rejects binary names containing path separators or shell metacharacters.
 *  - Rejects paths in world-writable temp directories (/tmp, /var/tmp, /dev/shm).
 *  - Rejects non-absolute resolution results.
 *  - Logs a warning for binaries outside well-known installation prefixes.
 *
 * @returns Absolute path to the binary.
 * @throws  If the binary is not found, the name is invalid, or the resolved
 *          path fails validation.
 */
export declare function resolveCliBinaryPath(binary: string): string;
/** Clear the resolved-path cache (for testing or session reset). */
export declare function clearResolvedPathCache(): void;
/** @internal Exposed for testing only. */
export declare const _testInternals: {
    UNTRUSTED_PATH_PATTERNS: RegExp[];
    getTrustedPrefixes: typeof getTrustedPrefixes;
};
export declare function getContract(agentType: CliAgentType): CliAgentContract;
export declare function isCliAvailable(agentType: CliAgentType): boolean;
export declare function validateCliAvailable(agentType: CliAgentType): void;
export declare function buildLaunchArgs(agentType: CliAgentType, config: WorkerLaunchConfig): string[];
export declare function buildWorkerArgv(agentType: CliAgentType, config: WorkerLaunchConfig): string[];
export declare function buildWorkerCommand(agentType: CliAgentType, config: WorkerLaunchConfig): string;
export declare function getWorkerEnv(teamName: string, workerName: string, agentType: CliAgentType): Record<string, string>;
export declare function parseCliOutput(agentType: CliAgentType, rawOutput: string): string;
/**
 * Check if an agent type supports prompt/headless mode (bypasses TUI).
 */
export declare function isPromptModeAgent(agentType: CliAgentType): boolean;
/**
 * Get the extra CLI args needed to pass an instruction in prompt mode.
 * Returns empty array if the agent does not support prompt mode.
 */
export declare function getPromptModeArgs(agentType: CliAgentType, instruction: string): string[];
export {};
//# sourceMappingURL=model-contract.d.ts.map