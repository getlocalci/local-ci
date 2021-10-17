# Local CI

[![2 day free preview](https://badgen.net/badge/trial/2%20day/red)](https://getlocalci.com)
[![Buy license key](https://badgen.net/badge/$/paid/yellow)](https://getlocalci.com)
[![Platform: macOS](https://badgen.net/badge/platform/MacOS/green)](https://getlocalci.come)
[![Requires CircleCI®](https://badgen.net/badge/requires/CircleCI%C2%AE/green)](https://circleci.com)
[![CircleCI® status](https://badgen.net/github/status/getlocalci/local-ci/develop/CircleCI)](https://circleci.com/gh/getlocalci/local-ci)

## Features

Debug CircleCI® jobs locally with Bash access and persistence between jobs. All in your local, without pushing commits and waiting. Not affiliated with CircleCI®.

![Local CI Demo](https://user-images.githubusercontent.com/4063887/132140183-e2b34f96-7e44-4f51-be33-59603c994a18.gif)

Thanks to [CirleCI-Public/cirlceci-cli](https://github.com/circleci-public/circleci-cli), which this uses.

This extension allows shell access to the jobs, and persists the workspace between jobs.

CircleCI® is a registered trademark of Circle Internet Services, Inc.

A paid extension with a 2 day free trial.

## Requirements

Docker

## Privacy

If you haven't entered a license key, this extension has no interaction with Local CI's site.

It does interact with CircleCI® and Docker to process and run the jobs.

But the jobs still only run locally.

Local CI has no server that runs jobs, and has no knowledge of the jobs or any data from them.

If you have entered a license key, it only sends to the Local CI site a `GET` request with an `md5` hash of your VS Code [machineId](https://code.visualstudio.com/api/references/vscode-api#3251).

This is to verify that the license is only being used on 1 machine.

Here's an example [machineId](https://code.visualstudio.com/api/references/vscode-api#3251): `b068aef3da6acff9c9bf4f129135ffd56adbfa294aeb8117c7264164c1a277d4`

Feel free to look at the [source code](https://github.com/getlocalci/local-ci/tree/develop/src) for how Local CI works.

## Use case

Local CI is intended for debugging jobs locally, not deploying.

In many cases, it won't be possible to deploy.

Local CI won't replace the CircleCI® service, it's a tool to use alongside it.

And it's not affiliated with CircleCI®.

## License
[GPL v2](LICENSE) or later
