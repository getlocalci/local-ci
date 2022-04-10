# Contributing to Local CI

## Local Setup

1. `npm i`
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

## Linting

`npm run lint`

This will also run on a pre-commit hook that will install on `npm i`

## Downloading A Build

You may want to install a development `.vsix` file, instead of installing this extension via the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=LocalCI.local-ci).

1. Click the commit check you want to download the `.vsix` for. This could be in a PR, or simply the `develop` branch.
2. For the package job, click Details.
3. Click the Artifacts tab
4. Click the `.vsix` file to download it:

https://user-images.githubusercontent.com/4063887/162601777-d12a00f2-6a27-47c7-bc8c-b505e77ca3dc.mp4

## Testing A Build Locally

1. Enter the Command Palette, either through a shortcut, or View > Command Palette
2. Type 'Extensions: Install from VSIX'
3. Select the Local CI `.vsix` file, maybe the one you [downloaded](#downloading-a-build)
