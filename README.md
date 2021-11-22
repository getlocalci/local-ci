[![2 day free preview](https://img.shields.io/badge/trial-2%20day-orange)](https://getlocalci.com)
[![Buy license key](https://img.shields.io/badge/%24-paid-orange)](https://getlocalci.com)
[![Platform: macOS](https://img.shields.io/badge/platform-macOS-yellow)](https://getlocalci.com)
[![Requires CircleCI®](https://img.shields.io/badge/requires-CirlcleCI%C2%AE-yellow)](https://circleci.com)

Debug entire CircleCI® workflows locally, with Bash access and persistence between jobs.

All in your local, no pushing commits and waiting. Not affiliated with CircleCI®.

![Local CI Demo](https://user-images.githubusercontent.com/4063887/142807072-fe6a577e-3148-4208-afed-ebd98a2d4fb1.gif)

## Run Jobs Locally

![Running job](https://user-images.githubusercontent.com/4063887/142660667-827e3ce0-8969-4b5d-a72d-251831294fa9.gif)

## Debugging

Get Bash access to the running job by clicking 'Local CI debugging':

![Bash in a running job](https://user-images.githubusercontent.com/4063887/142659294-6d6dce2b-1598-4b33-8aa8-f91c046af99f.gif)

When the job exits, you'll still have Bash access to the job.

## Run The Whole Workflow

You can even run jobs that depend on other jobs, because this persists the workspace between jobs:

![Persisting to the workspace](https://user-images.githubusercontent.com/4063887/142740238-13be4ff8-8c13-43a8-bd93-6536287d336b.jpg)

CI jobs can fail because of wrong dependency versions, or flaky combinations of events.

You'll get local Bash access to jobs, so you'll usually be able to see what's wrong and fix it.

Thanks to [CirleCI-Public/cirlceci-cli](https://github.com/circleci-public/circleci-cli), which this uses.

CircleCI® is a registered trademark of Circle Internet Services, Inc.

## License

Local CI requires a [license](https://getlocalci.com/buy/) for $70 per month.

But first you'll get a free 2-day preview, no sign-up or credit card needed.

## Requirements

[CircleCI®](https://circleci.com/), [macOS](https://en.wikipedia.org/wiki/MacOS), [Docker](https://www.docker.com/)

If you don't have a CircleCI® account, please [sign up here](https://circleci.com/docs/2.0/first-steps/).

A `.circleci/config.yml` file should be somewhere in the VS Code workspace, using the [2.x configuration](https://circleci.com/docs/2.0/configuration-reference/).

If there's more than one `.circleci/config.yml` file, click the gear icon to select which one to use:

![Selecting config file](https://user-images.githubusercontent.com/4063887/142739736-6d74052e-3fa8-45a4-a87e-e0cb24386a09.gif)

## Privacy

If you haven't entered a license key, like during the free preview, this extension has no interaction with Local CI's site.

It does interact with CircleCI® and Docker to process and run the jobs.

But the jobs still only run locally.

Local CI has no server that runs jobs, so the site has no knowledge of the jobs or any data from them.

If you have entered a license key, it only sends to the [Local CI site](https://getlocalci.com) a `GET` request with the license key and an `md5` hash of your VS Code [machineId](https://code.visualstudio.com/api/references/vscode-api#env).

This is to verify that the license key is only used on 1 machine.

Here's an example [machineId](https://code.visualstudio.com/api/references/vscode-api#env): `b068aef3da6acff9c9bf4f129135ffd56adbfa294aeb8117c7264164c1a277d4`

And that [machineId](https://code.visualstudio.com/api/references/vscode-api#env) is hashed with `md5` before sending it in the `GET` request.

Feel free to look at the [source code](https://github.com/getlocalci/local-ci/tree/develop/src) for how Local CI works.

## When To Use

Local CI won't replace the CircleCI® service, it's a debugging tool to use with it.

If you think CI will pass, it'll probably be faster to simply push a commit and let CI run.

Local CI is not for making deployments.

## License
[GPL v2](LICENSE) or later
