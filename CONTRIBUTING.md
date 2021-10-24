# Contributing to Local CI

## Local Setup

1. `npm i`
2. Open VS Code with this repo at the root of the workspace
3. VS Code > View > Run > Run Extension
<p align="left">
  <img src="https://user-images.githubusercontent.com/4063887/138580704-bcbef5ca-efce-461a-a97a-dcb335556498.gif" alt="running the extension">
</p>
4. This will open a new VS Code window
5. In that new window, File > Open > select a repo that has a `.circleci/config.yml` file
6. Click the Local CI icon on the left
7. You should see the CircleCI® jobs for that workspace
<p align="left">
  <img src="https://user-images.githubusercontent.com/4063887/138580844-4e882117-06dc-4eb0-b42d-5a7be18ebd38.gif" alt="jobs in editor">
</p>
8. As you make edits, click Restart in the Local CI repo to see the edits apply in the second window
