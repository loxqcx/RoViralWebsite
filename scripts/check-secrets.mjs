// Made by loxqcx on Discord.
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const stagedFilesResult = spawnSync('git', ['diff', '--cached', '--name-only', '--diff-filter=ACMR', '-z'], {
  encoding: 'utf8',
});

if (stagedFilesResult.status !== 0) process.exit(stagedFilesResult.status || 1);

const stagedFiles = stagedFilesResult.stdout.split('\0').filter(Boolean);
const trackedFilesResult = spawnSync('git', ['ls-files', '-z'], { encoding: 'utf8' });
if (trackedFilesResult.status !== 0) process.exit(trackedFilesResult.status || 1);
const trackedFiles = trackedFilesResult.stdout.split('\0').filter(Boolean);
const filesToCheck = [...new Set([...trackedFiles, ...stagedFiles])];
const secretPatterns = [
  /^\s*DISCORD_BOT_TOKEN\s*=\s*(?!your_|replace_|<)[^\s]+/im,
  /discord\.com\/api\/webhooks\/\d{10,}\/[A-Za-z0-9_-]{20,}/i,
];
const unsafeFiles = [];

for (const file of filesToCheck) {
  const isStaged = stagedFiles.includes(file);
  const content = isStaged
    ? spawnSync('git', ['show', `:${file}`], { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 }).stdout
    : (() => { try { return readFileSync(file, 'utf8'); } catch { return ''; } })();
  if (secretPatterns.some((pattern) => pattern.test(content))) {
    unsafeFiles.push(file);
  }
}

if (unsafeFiles.length) {
  console.error('Commit blocked: a Discord token or live webhook was found in staged files:');
  unsafeFiles.forEach((file) => console.error(`- ${file}`));
  console.error('Keep secrets only in .env.local or private hosting environment variables.');
  process.exit(1);
}

console.log('Secret check passed.');
