/// <reference path='binary.d.ts'/>
const { Binary } = require('@cloudflare/binary-install');
const { type, arch } = require('os');
const path = require('path');

const binaryVersion = '0.1.23667';

const supportedPlatforms = [
  {
    type: "Linux",
    architecture: "x64",
    url: `https://github.com/CircleCI-Public/circleci-cli/releases/download/v${binaryVersion}/circleci-cli_${binaryVersion}_linux_amd64.tar.gz`,
  },
  {
    type: "Linux",
    architecture: "arm64",
    url: `https://github.com/CircleCI-Public/circleci-cli/releases/download/v${binaryVersion}/circleci-cli_${binaryVersion}_linux_arm64.tar.gz`,
  },
  {
    type: "Darwin",
    architecture: "x64",
    url: `https://github.com/CircleCI-Public/circleci-cli/releases/download/v${binaryVersion}/circleci-cli_${binaryVersion}_darwin_amd64.tar.gz`,
  },
  {
    type: "Darwin",
    architecture: "arm64",
    url: `https://github.com/CircleCI-Public/circleci-cli/releases/download/v${binaryVersion}/circleci-cli_${binaryVersion}_darwin_amd64.tar.gz`,
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
    '../',
    'bin',
    'circleci',
    getSupportedPlatform().type,
    getSupportedPlatform().architecture,
    'bin',
    'circleci'
  );
}

function getBinary(platform) {
  return new Binary(platform.url, {
    name: "cirlceci",
    installDirectory: path.join(
      __dirname,
      '../',
      'bin',
      'circleci',
      platform.type,
      platform.architecture
    ),
  });
}

function install() {
  supportedPlatforms.forEach((platform) => getBinary(platform).install());
}

function uninstall() {
  supportedPlatforms.forEach((platform) => {
    getBinary(platform).uninstall();
  });
}

module.exports = {
  getBinaryPath,
  install,
  uninstall,
};
