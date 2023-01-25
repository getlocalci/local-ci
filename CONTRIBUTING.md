# Contributing to Local CI

## Local Setup

1. `nvm use && npm i`
2. Open VS Code with this repo at the root of the workspace
3. VS Code > View > Run > Run Extension:
<p align="left">
  <img src="https://user-images.githubusercontent.com/4063887/138580704-bcbef5ca-efce-461a-a97a-dcb335556498.gif" alt="running the extension">
</p>

4. This will open a new VS Code window
5. In that new window, File > Open > select a repo that has a `.circleci/config.yml` file
6. Click the Local CI icon on the left
7. You should see the CircleCI® jobs for that workspace:
<p align="left">
  <img src="https://user-images.githubusercontent.com/4063887/138580844-4e882117-06dc-4eb0-b42d-5a7be18ebd38.gif" alt="jobs in editor">
</p>

8. As you make edits, click Restart in the Local CI repo to see the edits apply in the second window:
<p align="left">
  <img src="https://user-images.githubusercontent.com/4063887/138581226-9aeb09aa-e9c4-44e3-8b22-a6022080119b.gif" alt="restarting the editor">
</p>

9. If step 3 causes the warning "The task 'npm: watch' cannot be tracked," you can either activate the extension [TypeScript + Webpack Problem Matchers](https://marketplace.visualstudio.com/items?itemName=amodio.tsl-problem-matcher), or manually do `npm run watch` and click "Debug Anyway."

## Linting

`npm run lint`

This will also run on a pre-commit hook that will install on `npm i`

## Downloading A Build From A Commit

You may want to downlod and install a development `.vsix` file, instead of installing this extension via the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=LocalCI.local-ci).

You'll need to be logged into at least a [free CircleCI account](https://circleci.com/signup/) for this.

Also, it'd be good to use Firefox instead of Chrome. It looks like Chrome converts the `.vsix` file into an unusable `.zip` file on downloading it.

1. Click the commit check you want to download the `.vsix` for. This could be in a PR, or simply the `develop` branch.
2. For the package job, click Details
3. Click the Artifacts tab
4. Click the `.vsix` file to download it:

https://user-images.githubusercontent.com/4063887/162601777-d12a00f2-6a27-47c7-bc8c-b505e77ca3dc.mp4

(No audio in this video)

## Testing A Build Locally

1. Enter the Command Palette, either through a shortcut, or View > Command Palette
2. Type 'Extensions: Install from VSIX'
3. Select the Local CI `.vsix` file, maybe the one you [downloaded](#downloading-a-build-from-a-commit)
