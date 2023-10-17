[![Buy license key](https://img.shields.io/badge/%24-paid-orange)](https://getlocalci.com/pricing/?utm_medium=extension&utm_source=readme)
[![30 day free trial](https://img.shields.io/badge/trial-30%20day-orange)](https://getlocalci.com/pricing/?utm_medium=extension&utm_source=readme)
[![Platform: macOS](https://img.shields.io/badge/platform-macOS-yellow)](https://en.wikipedia.org/wiki/MacOS)
[![Requires CircleCI®](https://img.shields.io/badge/requires-CirlcleCI%C2%AE-yellow)](https://circleci.com/docs/2.0/first-steps/)

Debug entire CircleCI® workflows locally, with Bash access and caching between jobs.

All in your local, no pushing commits and waiting. Not affiliated with CircleCI®.

![Local CI Demo](https://user-images.githubusercontent.com/4063887/142807072-fe6a577e-3148-4208-afed-ebd98a2d4fb1.gif)

Author: Ryan Kienstra, ryan@ryankienstra.com

## Run Jobs Locally

![Running job](https://user-images.githubusercontent.com/4063887/142660667-827e3ce0-8969-4b5d-a72d-251831294fa9.gif)

## Debugging

Get Bash access to the running job by clicking 'Local CI debugging':

![Bash in a running job](https://user-images.githubusercontent.com/4063887/143146648-2eb7ed7c-b257-420a-a612-2ba319eb82c4.gif)

When the job exits, you'll still have Bash access to the job.

## Restore And Save Cache

Run jobs faster when you cache dependencies.

Local CI supports the [native](https://circleci.com/docs/2.0/caching/) `restore_cache` and `save_cache` values:

![Editor with restore cache](https://user-images.githubusercontent.com/4063887/146306642-87ccc2c3-5e99-467e-ae41-70ecaef1bcc6.png)

## Run The Whole Workflow

You can even run jobs that depend on other jobs, because this persists the workspace between jobs:

![Persisting to the workspace](https://user-images.githubusercontent.com/4063887/142740238-13be4ff8-8c13-43a8-bd93-6536287d336b.jpg)

CI jobs can fail because of wrong dependency versions, or flaky combinations of events.

You'll get local Bash access to jobs, so you'll usually be able to see what's wrong and fix it.

Thanks to [CirleCI-Public/cirlceci-cli](https://github.com/circleci-public/circleci-cli) and [mikefarah/yq](https://github.com/mikefarah/yq), which this uses.

CircleCI® is a registered trademark of Circle Internet Services, Inc.

## Dynamic Configs

You can run most [dynamic configs](https://getlocalci.com/circleci-dynamic-config/) with Local CI.

Find out in seconds whether the setup is right, all in your local.

## License Key

Local CI requires a [license key](https://getlocalci.com/pricing/?utm_medium=extension&utm_source=readme) for $20 per month.

But first you'll get a free 30-day trial, no credit card needed.

## Requirements

[CircleCI®](https://circleci.com/docs/2.0/first-steps/), [macOS](https://en.wikipedia.org/wiki/MacOS), [Docker](https://www.docker.com/)

If you don't have a CircleCI® account, you can [get started](https://circleci.com/docs/2.0/first-steps/) with CircleCI® for free.

A `.circleci/config.yml` file should be somewhere in the VS Code workspace, using the [2.x configuration](https://circleci.com/docs/2.0/configuration-reference/).

If there's more than one `.circleci/config.yml` file, click the gear icon to select which one to use:

![Selecting config file](https://user-images.githubusercontent.com/4063887/142739736-6d74052e-3fa8-45a4-a87e-e0cb24386a09.gif)

## Privacy

You can opt out of all telemetry by adding this to your VS Code `settings.json`:

`"telemetry.telemetryLevel": "off"`

If you haven't opted out, here are the [telemetry events](https://github.com/getlocalci/local-ci/search?q=reporter.send) sent via [VS Code telemetry](https://code.visualstudio.com/docs/getstarted/telemetry).

If you haven't entered a license key, like during the free trial, the only interaction this extension has with Local CI's site is if you optionally enter your email on first activating this extension.

It does interact with CircleCI® and Docker to process and run the jobs.

But the jobs still only run locally.

Local CI has no server that runs jobs, so the site has no knowledge of the jobs or any data from them.

If you have entered a license key, it only sends to the [Local CI site](https://getlocalci.com) a `GET` request with the license key and a `SHA-256` hash of your VS Code [machineId](https://code.visualstudio.com/api/references/vscode-api#env).

This is to verify that the license key is only used on 1 machine.

Here's an example [machineId](https://code.visualstudio.com/api/references/vscode-api#env): `b068aef3da6acff9c9bf4f129135ffd56adbfa294aeb8117c7264164c1a277d4`

And that [machineId](https://code.visualstudio.com/api/references/vscode-api#env) is hashed with `SHA-256` before sending it in the `GET` request.

Feel free to look at the [source code](https://github.com/getlocalci/local-ci/tree/develop/src) for how Local CI works.

## When To Use

Local CI won't replace the CircleCI® service, it's a debugging tool to use with it.

If you think CI will pass, it'll probably be faster to simply push a commit and let CI run.

Local CI is not for making deployments.

## License
[GPL v2](LICENSE) or later
