import { execSync } from 'child_process';
import { cwd } from 'process';
import { join } from 'path';

// Forked from https://github.com/cloudflare/binary-install/blob/a1dc431b2c9b318d21d7f0b2f1abfb27526a2384/packages/binary-install/src/binary.js#L116-L130
export default function (args: string): string {
  const result = execSync(
    `${join(__dirname, '../node_modules/circleci/bin/circleci')} ${args}`,
    { cwd: cwd() }
  );

  if (result.error) {
    console.error(result.error);
  }

  return result.toString();
}
