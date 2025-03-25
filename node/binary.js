/// <reference path='binary.d.ts'/>
const { type, arch } = require('os');
const path = require('path');
const fs = require('fs');
const https = require('https');
const zlib = require('zlib');
const tar = require('tar-fs');

const binaryVersion = '0.1.31425';

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
    'circleci'
  );
}

function downloadAndExtract(url, installDirectory) {
  return new Promise((resolve, reject) => {
    const tempFilePath = path.join(installDirectory, 'temp.tar.gz');

    fs.mkdirSync(installDirectory, { recursive: true });
    const file = fs.createWriteStream(tempFilePath);
    https.get(url, (response) => {
      if (response.statusCode === 302 && response.headers.location) {
        response.destroy();
        return download(response.headers.location);
      }

      if (response.statusCode !== 200) {
        return reject(new Error(`Failed to download binary: ${response.statusCode}`));
      }

      response.pipe(file);
      file.on('finish', () => {
        file.close(() => {
          const tempExtractDir = path.join(installDirectory, 'temp-extract');
          fs.mkdirSync(tempExtractDir, { recursive: true });

          fs.createReadStream(tempFilePath)
            .pipe(zlib.createGunzip())
            .pipe(tar.extract(tempExtractDir))
            .on('finish', () => {
              fs.readdirSync(tempExtractDir).forEach((dir) => {
                fs.readdirSync(path.join(tempExtractDir, dir)).forEach((file) => {
                  if (file === 'circleci') {
                    const srcPath = path.join(tempExtractDir, dir, file);
                    const destPath = path.join(installDirectory, file);
                    fs.renameSync(srcPath, destPath);
                  }
                })
              });

              fs.rmSync(tempExtractDir, { recursive: true, force: true });
              fs.unlinkSync(tempFilePath);

              resolve();
            })
            .on('error', (err) => {
              if (fs.existsSync(tempExtractDir)) {
                fs.rmSync(tempExtractDir, { recursive: true, force: true });
              }
              if (fs.existsSync(tempFilePath)) {
                fs.unlinkSync(tempFilePath);
              }
              reject(err);
            });
        });
      });
    }).on('error', (err) => {
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      reject(err);
    });
  });
}

async function install() {
  for (const platform of supportedPlatforms) {
    const installDirectory = path.join(
      __dirname,
      '../',
      'bin',
      'circleci',
      platform.type,
      platform.architecture
    );

    try {
      console.log(`Installing binary for ${platform.type} ${platform.architecture}...`);
      if (fs.existsSync(installDirectory)) {
        fs.rmSync(installDirectory, { recursive: true });
      }
      await downloadAndExtract(platform.url, installDirectory);
      console.log(`Installed binary for ${platform.type} ${platform.architecture}`);
    } catch (error) {
      console.error(`Failed to install binary for ${platform.type} ${platform.architecture}:`, error);
    }
  }
}

function uninstall() {
  for (const platform of supportedPlatforms) {
    const installDirectory = path.join(
      __dirname,
      '../',
      'bin',
      'circleci',
      platform.type,
      platform.architecture
    );

    if (fs.existsSync(installDirectory)) {
      fs.rmSync(installDirectory, { recursive: true, force: true });
      console.log(`Uninstalled binary for ${platform.type} ${platform.architecture}`);
    }
  }
}

module.exports = {
  getBinaryPath,
  install,
  uninstall,
};
