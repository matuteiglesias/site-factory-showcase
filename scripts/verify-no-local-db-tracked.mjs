import { execFileSync } from 'node:child_process';

const forbiddenPaths = ['prisma/dev.db', '.env'];
const forbiddenPrefixes = ['.next/'];

function trackedFiles() {
  return execFileSync('git', ['ls-files'], { encoding: 'utf8' })
    .split('\n')
    .filter(Boolean);
}

const tracked = trackedFiles();
const violations = tracked.filter(
  (file) =>
    forbiddenPaths.includes(file) ||
    forbiddenPrefixes.some((prefix) => file === prefix.slice(0, -1) || file.startsWith(prefix)),
);

if (violations.length > 0) {
  console.error('Local-only files are tracked and must be removed from git:');
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  process.exit(1);
}

console.log('OK no local database/env/build artifacts are tracked.');
