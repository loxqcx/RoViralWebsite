// Made by loxqcx on Discord.
import { readFileSync, unlinkSync, writeFileSync } from 'node:fs';

const processIsRunning = (pid) => {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
};

export function acquireProcessLock(lockPath, pid = process.pid) {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      writeFileSync(lockPath, String(pid), { flag: 'wx' });
      return () => {
        try {
          if (readFileSync(lockPath, 'utf8').trim() === String(pid)) unlinkSync(lockPath);
        } catch {
          // The lock was already released.
        }
      };
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
      const existingPid = Number.parseInt(readFileSync(lockPath, 'utf8'), 10);
      if (Number.isInteger(existingPid) && processIsRunning(existingPid)) return null;
      try { unlinkSync(lockPath); } catch { return null; }
    }
  }
  return null;
}
