#!/bin/bash

set -e

if [[ ! -d node_modules ]]; then
  echo "This script is meant to be ran in the project root!"
  exit 1
fi

echo "[--] Parsing current helppo version"
helppo_version=$(cat package.json | grep '"version":' | sed -E 's/^ *"version": "([^"]+)",?$/\1/')
echo $helppo_version

echo "[--] Printing instructions"
build_command="docker build -t codeclown/helppo:$helppo_version -t codeclown/helppo:latest --build-arg HELPPO_CLI_VERSION=$helppo_version ."
test_command="docker run --rm codeclown/helppo:$helppo_version --help"
push_command="docker push codeclown/helppo:$helppo_version && docker push codeclown/helppo:latest"
echo "Run the following commands in order:"
echo "  $build_command"
echo "  $test_command # should see help message"
echo "  $push_command"
