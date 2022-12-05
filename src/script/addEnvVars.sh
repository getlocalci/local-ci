#!/bin/sh

# shellcheck disable=SC2016
echo "export CIRCLE_SHA1=$(git rev-parse HEAD)"
echo "export CIRCLE_BRANCH=$(git rev-parse --abbrev-ref HEAD)"
echo "export CIRCLE_PROJECT_REPONAME=$(basename "$(git remote get-url origin)")"
echo "export CIRCLE_REPOSITORY_URL=$(git remote get-url origin)"
