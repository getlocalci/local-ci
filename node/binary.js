/// <reference path='binary.d.ts'/>
const { Binary } = require('@cloudflare/binary-install');
const { type, arch } = require('os');
const path = require('path');

const { cTable } = require('console.table');

// File mainly copied from https://github.com/cloudflare/binary-install/blob/a1dc431b2c9b318d21d7f0b2f1abfb27526a2384/packages/binary-install-example/binary.js
function error(msg) {
  console.error(msg);
  process.exit(1);
};

const supportedPlatforms = [
  {
    type: "Linux",
    architecture: "x64",
    url: "https://github.com/CircleCI-Public/circleci-cli/releases/download/v0.1.17087/circleci-cli_0.1.17087_linux_amd64.tar.gz",
  },
  {
    type: "Darwin",
    architecture: "x64",
    url: "https://github.com/CircleCI-Public/circleci-cli/releases/download/v0.1.17087/circleci-cli_0.1.17087_darwin_amd64.tar.gz",
  },
  {
    type: "Darwin",
    architecture: "arm64",
    url: "https://github.com/CircleCI-Public/circleci-cli/releases/download/v0.1.17554/circleci-cli_0.1.17554_darwin_amd64.tar.gz",
  },
];

function getSupportedPlatform() {
  return supportedPlatforms.find(
    (supportedPlatform) =>
      type() === supportedPlatform.type &&
      arch() === supportedPlatform.architecture
  );
}

function getBinaryPath() {
  return path.join(
    __dirname,
    `../bin/circleci/${getSupportedPlatform().type}/bin/circleci`
  );
}

function getBinaryUrl() {
  const supportedPlatform = getSupportedPlatform();

  if (supportedPlatform) {
    return supportedPlatform.url;
  }

  error(
    `Platform with type "${platformType}" and architecture "${architecture}" is not supported.\nYour system must be one of the following:\n\n${cTable.getTable(
      supportedPlatforms
    )}`
  );
}

function getBinary(platform) {
  const url = getBinaryUrl();
  return new Binary(url, {
    name: "cirlceci",
    installDirectory: path.join(
      __dirname,
      `../bin/circleci/${platform}`
    ),
  });
}

function install() {
  supportedPlatforms.forEach((platform) => getBinary(platform.type).install());
}

function uninstall() {
  getBinary().uninstall();
}

module.exports = {
  getBinaryPath,
  install,
  uninstall,
};
