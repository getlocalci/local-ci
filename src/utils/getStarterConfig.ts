export default function getStarterConfig(): string {
  return `# https://circleci.com/docs/2.0/config-intro/

version: 2.1
executors:
  node:
    docker:
      - image: cimg/node:16.8.0-browsers

jobs:
  test:
    executor:
      name: node
    steps:
      - checkout
      - run: echo "Running example step, please edit this file"

workflows:
  test-lint:
    jobs:
      - test:
          filters:
            tags:
              only: /.*/\n`;
}
