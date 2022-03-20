# Change Log

## 1.5.0 - 17 March 2022

### Added
- Use of `yq` for cleaner terminal output. [#96](https://github.com/getlocalci/local-ci/pull/96)
- Add a confirmation dialog to run a job. [#93](https://github.com/getlocalci/local-ci/pull/93)

### Fixed
- Update most npm packages to the latest. [#94](https://github.com/getlocalci/local-ci/pull/94)

## 1.4.9 - 5 March 2022

### Fixed
- Update npm packages. [#91](https://github.com/getlocalci/local-ci/pull/91)

## 1.4.8 - 26 February 2022

### Fixed
- Update the binary and npm packages. [#89](https://github.com/getlocalci/local-ci/pull/89)
- Bump follow-redirects from `1.14.7` to `1.14.8`. [#88](https://github.com/getlocalci/local-ci/pull/88)

## 1.4.7 - 7 February 2022

### Fixed
- Fix a bug where `save_cache` wasn't recognized. [#85](https://github.com/getlocalci/local-ci/pull/85)
- Bump npm dependencies to the latest. [#84](https://github.com/getlocalci/local-ci/pull/84)

## 1.4.6 - 28 January 2022

### Fixed
- Improve bash script formatting, bump npm packages. [#79](https://github.com/getlocalci/local-ci/pull/79), [#81](https://github.com/getlocalci/local-ci/pull/81)
- Fix a bug where the env var wasn't echoed. [#82](https://github.com/getlocalci/local-ci/pull/82)

## 1.4.5 - 20 January 2022

### Fixed
- Ensure jobs have most recent config. [#77](https://github.com/getlocalci/local-ci/pull/77)

## 1.4.4 - 13 January 2022

### Fixed
- Improved handling of dynamic configs, especially with the continuation orb. [#75](https://github.com/getlocalci/local-ci/pull/75/)
- Prevent error from no job. [#75](https://github.com/getlocalci/local-ci/pull/75/)

## 1.4.3 - 7 January 2022

### Added
- Add several helper notices, like for internet connection. [#73](https://github.com/getlocalci/local-ci/pull/73/)

### Fixed
- Stop committing images when the job succeeds or fails. [#73](https://github.com/getlocalci/local-ci/pull/73/)

## 1.4.2 - 4 January 2022

### Added
- Optionally create a config file when none exists. [#69](https://github.com/getlocalci/local-ci/pull/69/)
- Bump `vsce` package to the latest version. [#68](https://github.com/getlocalci/local-ci/pull/68/)

## 1.4.1 - 3 January 2022

### Added
- Improve detection of job success. [#67](https://github.com/getlocalci/local-ci/pull/67/)
- Add a 'Learn more' link when there's no `.circleci/config.yml`. [#67](https://github.com/getlocalci/local-ci/pull/67/)

## 1.4.0 - 2 January 2022

### Added
- Basic support for dynamic configs. [#66](https://github.com/getlocalci/local-ci/pull/66/)
- Add ✅ and ❌ after jobs, depending on whether they passed. [#66](https://github.com/getlocalci/local-ci/pull/66/)

## 1.3.2 - 19 December 2021

### Added
- Nest jobs by dependencies, so you can see the order to run jobs. [#58](https://github.com/getlocalci/local-ci/pull/58)

## 1.3.1 - 16 December 2021

### Added
- Allow entering a CircleCI® API token. [#57](https://github.com/getlocalci/local-ci/pull/57)

## 1.3.0 - 15 December 2021

### Added
- Support `save_cache` and `restore_cache`. [#53](https://github.com/getlocalci/local-ci/pull/53/)
- Prevent taking up too much storage with committed images. [#53](https://github.com/getlocalci/local-ci/pull/53/)
- Add more telemetry events, like for no config paths, or wrong OS. [#56](https://github.com/getlocalci/local-ci/pull/56)

## 1.2.0 - 7 December 2021

### Added
- Telemetry, including for errors like if there are no jobs. [#55](https://github.com/getlocalci/local-ci/pull/55/)

### Fixed
- Fix cannot stat error in `tmp/`. [#54](https://github.com/getlocalci/local-ci/pull/54)

## 1.1.0 - 6 December 2021

### Added
- Telemetry for activating, running a job, and no jobs, opt out with `"telemetry.telemetryLevel": "off"`. [#50](https://github.com/getlocalci/local-ci/pull/50/)

## 1.0.2 - 5 December 2021

### Added
- Extend the free preview for filling out a 2-minute survey. [#49](https://github.com/getlocalci/local-ci/pull/49/)

## 1.0.1 - 24 November 2021

### Added
- Bump the CLI to the latest. [#44](https://github.com/getlocalci/local-ci/pull/44/)

### Fixed
- Correct links to macOS. [#44](https://github.com/getlocalci/local-ci/pull/44/)

## 1.0.0 - 22 November 2021

### Added
- Allow running jobs in VS Code, with a TreeView UI
- Open a terminal to show the running job
- Open a debugging terminal for Bash access to the job
- If the job fails, open another Bash terminal
- Select from multiple config files in a workspace
- Add a walkthrough that runs a job and prompts to run another
- Show a notice if Docker isn't running
- Add a warning if there are uncommitted changes
