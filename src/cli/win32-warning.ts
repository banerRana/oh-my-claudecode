import chalk from 'chalk';

/**
 * Warn if running on native Windows (win32), where tmux is not available.
 * Called at CLI startup from src/cli/index.ts.
 */
export function warnIfWin32(): void {
  if (process.platform === 'win32') {
    console.warn(chalk.yellow.bold('\n⚠  WARNING: Native Windows (win32) detected'));
    console.warn(chalk.yellow('   OMC requires tmux, which is not available on native Windows.'));
    console.warn(chalk.yellow('   Please use WSL2 instead: https://learn.microsoft.com/en-us/windows/wsl/install'));
    console.warn(chalk.red('   Native win32 support issues will not be accepted. Figure it out yourself.'));
    console.warn('');
  }
}
