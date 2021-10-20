# Local CI

[![2 day free preview](https://img.shields.io/badge/trial-2%20day-red)](https://getlocalci.com)
[![Buy license key](https://img.shields.io/badge/%24-paid-red)](https://getlocalci.com)
[![Platform: macOS](https://img.shields.io/badge/platform-macOS-brightgreen)](https://getlocalci.come)
[![Requires CircleCI®](https://img.shields.io/badge/requires-CirlcleCI%C2%AE-brightgreen)](https://circleci.com)

## Features

Debug CircleCI® jobs locally with Bash access and persistence between jobs. All in your local, without pushing commits and waiting. Not affiliated with CircleCI®.

![Local CI Demo](https://user-images.githubusercontent.com/4063887/132140183-e2b34f96-7e44-4f51-be33-59603c994a18.gif)

Thanks to [CirleCI-Public/cirlceci-cli](https://github.com/circleci-public/circleci-cli), which this uses.

This extension allows shell access to the jobs, and persists the workspace between jobs.

CircleCI® is a registered trademark of Circle Internet Services, Inc.

Local CI is a paid extension with a 2 day free trial.

## Requirements

[macOS](https://en.wikipedia.org/wiki/MacOS), [CircleCI®](https://circleci.com/), [Docker](https://www.docker.com/)

## Privacy

If you haven't entered a license key, this extension has no interaction with Local CI's site.

It does interact with CircleCI® and Docker to process and run the jobs.

But the jobs still only run locally.

Local CI has no server that runs jobs, and has no knowledge of the jobs or any data from them.

If you have entered a license key, it only sends to the Local CI site a `GET` request with the license key and an `md5` hash of your VS Code [machineId](https://code.visualstudio.com/api/references/vscode-api#3251).

This is to verify that the license key is only used on 1 machine.

Here's an example [machineId](https://code.visualstudio.com/api/references/vscode-api#3251): `b068aef3da6acff9c9bf4f129135ffd56adbfa294aeb8117c7264164c1a277d4`

And that [machineId](https://code.visualstudio.com/api/references/vscode-api#3251) is hashed with `md5` before sending it in the `GET` request.

Feel free to look at the [source code](https://github.com/getlocalci/local-ci/tree/develop/src) for how Local CI works.

## Use Case

Local CI won't replace the CircleCI® service, it's a tool to use alongside it.

If you think CI will pass, it'll probably be faster to simply push a commit and let CI run.

Local CI is for debugging locally, not deploying.

Not affiliated with CircleCI®.

## License
[GPL v2](LICENSE) or later
