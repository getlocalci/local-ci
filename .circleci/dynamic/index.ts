import * as fs from "fs";
import CircleCI from "@circleci/circleci-config-sdk";

const config = new CircleCI.Config();
const workflow = new CircleCI.Workflow("test-lint");
config.addWorkflow(workflow);

[
  new CircleCI.Job(
    "test",
    new CircleCI.executors.DockerExecutor("cimg/node:16.17", "large"),
    [
      new CircleCI.commands.Checkout(),
      new CircleCI.commands.Run({ command: "npm ci && npm test && npm run lint" }),
    ]
  ),
  new CircleCI.Job(
    "package",
    new CircleCI.executors.DockerExecutor("cimg/node:16.8.0-browsers", "large"),
    [
      new CircleCI.commands.Checkout(),
      new CircleCI.commands.Run({ command: "npm ci && npm run vsix" }),
      new CircleCI.commands.Run({ command: "mkdir /tmp/artifacts && mv local-ci*.vsix /tmp/artifacts" }),
      new CircleCI.commands.StoreArtifacts({ path: "/tmp/artifacts" }),
    ],
  )
].forEach((job) => {
  config.addJob(job);
  workflow.addJob(job);
});

fs.writeFile("./dynamicConfig.yml", config.stringify(), () => {});
