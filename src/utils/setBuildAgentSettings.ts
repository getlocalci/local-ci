import * as cp from 'child_process';
import { type, arch } from 'os';
import getSpawnOptions from './getSpawnOptions';

function isIntelMac() {
  return type() === 'Darwin' && arch() === 'x64';
}

export default function setBuildAgentSettings() {
  if (!isIntelMac()) {
    return;
  }

  cp.spawn(
    '/bin/sh',
    [
      '-c',
      `settings_file=~/.circleci/build_agent_settings.json
      rm $settings_file 2>/dev/null
      mkdir -p ~/.circleci
      echo '{"LatestSha256":"sha256:008ba7f4223f1e26c11df9575283491b620074fa96da6961e0dcde47fb757014"}' > $settings_file`,
    ],
    {
      ...getSpawnOptions(),
      timeout: 5000,
    }
  );
}
