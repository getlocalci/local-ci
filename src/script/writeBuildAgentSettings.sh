#!/bin/sh

settings_file=~/.circleci/build_agent_settings.json
rm $settings_file 2>/dev/null
mkdir -p ~/.circleci
echo '{"LatestSha256":"sha256:008ba7f4223f1e26c11df9575283491b620074fa96da6961e0dcde47fb757014"}' > $settings_file
