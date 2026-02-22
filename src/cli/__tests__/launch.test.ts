import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { execFileSync } from 'child_process';

vi.mock('child_process', async (importOriginal) => {
  const actual = await importOriginal<typeof import('child_process')>();
  return {
    ...actual,
    execFileSync: vi.fn(),
  };
});

vi.mock('../tmux-utils.js', () => ({
  resolveLaunchPolicy: vi.fn(),
  buildTmuxSessionName: vi.fn(() => 'test-session'),
  buildTmuxShellCommand: vi.fn(() => ''),
  quoteShellArg: vi.fn((s: string) => s),
  listHudWatchPaneIdsInCurrentWindow: vi.fn(() => []),
  createHudWatchPane: vi.fn(() => null),
  killTmuxPane: vi.fn(),
  isClaudeAvailable: vi.fn(() => true),
}));

import { runClaude } from '../launch.js';
import { resolveLaunchPolicy } from '../tmux-utils.js';

describe('runClaude — exit code propagation', () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.resetAllMocks();
    processExitSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
  });

  afterEach(() => {
    processExitSpy.mockRestore();
  });

  describe('direct policy', () => {
    beforeEach(() => {
      (resolveLaunchPolicy as ReturnType<typeof vi.fn>).mockReturnValue('direct');
    });

    it('propagates Claude non-zero exit code', () => {
      const err = Object.assign(new Error('Command failed'), { status: 2 });
      (execFileSync as ReturnType<typeof vi.fn>).mockImplementation(() => { throw err; });

      runClaude('/tmp', [], 'sid');

      expect(processExitSpy).toHaveBeenCalledWith(2);
    });

    it('exits with code 1 when status is null', () => {
      const err = Object.assign(new Error('Command failed'), { status: null });
      (execFileSync as ReturnType<typeof vi.fn>).mockImplementation(() => { throw err; });

      runClaude('/tmp', [], 'sid');

      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('exits with code 1 on ENOENT', () => {
      const err = Object.assign(new Error('Not found'), { code: 'ENOENT' });
      (execFileSync as ReturnType<typeof vi.fn>).mockImplementation(() => { throw err; });

      runClaude('/tmp', [], 'sid');

      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('does not call process.exit on success', () => {
      (execFileSync as ReturnType<typeof vi.fn>).mockReturnValue(Buffer.from(''));

      runClaude('/tmp', [], 'sid');

      expect(processExitSpy).not.toHaveBeenCalled();
    });
  });

  describe('inside-tmux policy', () => {
    beforeEach(() => {
      (resolveLaunchPolicy as ReturnType<typeof vi.fn>).mockReturnValue('inside-tmux');
      process.env.TMUX_PANE = '%0';
    });

    afterEach(() => {
      delete process.env.TMUX_PANE;
    });

    it('propagates Claude non-zero exit code', () => {
      const err = Object.assign(new Error('Command failed'), { status: 3 });
      (execFileSync as ReturnType<typeof vi.fn>).mockImplementation(() => { throw err; });

      runClaude('/tmp', [], 'sid');

      expect(processExitSpy).toHaveBeenCalledWith(3);
    });

    it('exits with code 1 when status is null', () => {
      const err = Object.assign(new Error('Command failed'), { status: null });
      (execFileSync as ReturnType<typeof vi.fn>).mockImplementation(() => { throw err; });

      runClaude('/tmp', [], 'sid');

      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('exits with code 1 on ENOENT', () => {
      const err = Object.assign(new Error('Not found'), { code: 'ENOENT' });
      (execFileSync as ReturnType<typeof vi.fn>).mockImplementation(() => { throw err; });

      runClaude('/tmp', [], 'sid');

      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('does not call process.exit on success', () => {
      (execFileSync as ReturnType<typeof vi.fn>).mockReturnValue(Buffer.from(''));

      runClaude('/tmp', [], 'sid');

      expect(processExitSpy).not.toHaveBeenCalled();
    });
  });
});
