// Made by loxqcx on Discord.
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { acquireProcessLock } from './process-lock.js';

const directories = [];
afterEach(() => directories.splice(0).forEach((directory) => rmSync(directory, { recursive: true, force: true })));

const makeLockPath = () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'roviral-bot-'));
  directories.push(directory);
  return path.join(directory, 'bot.pid');
};

describe('bot process lock', () => {
  it('acquires and releases a lock', () => {
    const lockPath = makeLockPath();
    const release = acquireProcessLock(lockPath, process.pid);
    expect(readFileSync(lockPath, 'utf8')).toBe(String(process.pid));
    release();
    expect(() => readFileSync(lockPath)).toThrow();
  });

  it('refuses a second running process', () => {
    const lockPath = makeLockPath();
    writeFileSync(lockPath, String(process.pid));
    expect(acquireProcessLock(lockPath, process.pid + 1)).toBeNull();
  });

  it('replaces a stale lock when a container reuses the same pid', () => {
    const lockPath = makeLockPath();
    writeFileSync(lockPath, String(process.pid));
    const release = acquireProcessLock(lockPath, process.pid);
    expect(release).toBeTypeOf('function');
    release();
  });
});
