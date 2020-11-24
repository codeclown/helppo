#!/bin/bash

set -e

# Wrapper script so we can forward command-line arguments to helppo-cli
# This allows users to run just (which connects to default dev database):
#   yarn dev
# But users can also specify helppo-cli arguments:
#   yarn dev --no-color postgres://postgres:postgres@localhost:5432/postgres

args="$@"
if [[ ! $args ]]; then
  args="mysql://root:secret@127.0.0.1:7812/dev_db"
fi

yarn build

concurrently "yarn watch:css" "yarn watch:js" "yarn watch:server" "yarn watch:dev-server --dev $args"
