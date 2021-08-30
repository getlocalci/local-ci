/// <reference path="binary.d.ts"/>
const { Binary } = require("@cloudflare/binary-install");
const { type, arch } = require("os");
const path = require("path");

const { cTable } = require("console.table");

// Mainly copied from https://github.com/cloudflare/binary-install/blob/a1dc431b2c9b318d21d7f0b2f1abfb27526a2384/packages/binary-install-example/binary.js
const error = (msg) => {
  console.error(msg);
  process.exit(1);
};

const supportedPlatforms = [
  {
    type: "Windows_NT",
    architecture: "x64",
    url: "https://github.com/CircleCI-Public/circleci-cli/releases/download/v0.1.15900/circleci-cli_0.1.15900_windows_amd64.zip",
  },
  {
    type: "Linux",
    architecture: "x64",
    url: "https://github.com/CircleCI-Public/circleci-cli/releases/download/v0.1.15900/circleci-cli_0.1.15900_linux_amd64.tar.gz",
  },
  {
    type: "Darwin",
    architecture: "x64",
    url: "https://github.com/CircleCI-Public/circleci-cli/releases/download/v0.1.15900/circleci-cli_0.1.15900_darwin_amd64.tar.gz",
  },
];

function getSupportedPlatform() {
  const platformType = type();
  const architecture = arch();

  return supportedPlatforms.find(
    (supportedPlatform) =>
      platformType === supportedPlatform.type &&
      architecture === supportedPlatform.architecture
  );
}

function getBinaryPath() {
  return path.join(
    __dirname,
    `../node_modules/circleci/${getSupportedPlatform()?.type}/bin/circleci`
  );
}

const getBinaryUrl = () => {
  const supportedPlatform = getSupportedPlatform();

  if (supportedPlatform) {
    return supportedPlatform.url;
  }

  error(
    `Platform with type "${platformType}" and architecture "${architecture}" is not supported.\nYour system must be one of the following:\n\n${cTable.getTable(
      supportedPlatforms
    )}`
  );
};

const getBinary = (platform) => {
  const url = getBinaryUrl();
  return new Binary(url, {
    name: "cirlceci",
    installDirectory: path.join(
      __dirname,
      `../node_modules/circleci/${platform}`
    ),
  });
};

const install = () =>
  supportedPlatforms.forEach((platform) => getBinary(platform.type).install());

const uninstall = () => {
  const binary = getBinary();
  binary.uninstall();
};

module.exports = {
  install,
  uninstall,
  getBinaryPath,
};
