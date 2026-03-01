// Re-exports from model-contract.ts for backward compatibility
// and additional CLI detection utilities
export { isCliAvailable, validateCliAvailable, getContract, resolveCliBinaryPath, clearResolvedPathCache } from './model-contract.js';
import { spawnSync } from 'child_process';
import { resolveCliBinaryPath } from './model-contract.js';
export function detectCli(binary) {
    try {
        const resolvedPath = resolveCliBinaryPath(binary);
        const versionResult = spawnSync(resolvedPath, ['--version'], { timeout: 5000 });
        if (versionResult.status === 0) {
            return {
                available: true,
                version: versionResult.stdout?.toString().trim(),
                path: resolvedPath,
            };
        }
        return { available: false };
    }
    catch {
        return { available: false };
    }
}
export function detectAllClis() {
    return {
        claude: detectCli('claude'),
        codex: detectCli('codex'),
        gemini: detectCli('gemini'),
    };
}
//# sourceMappingURL=cli-detection.js.map