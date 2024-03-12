#!/usr/bin/env bash

VERSION="$(cat VERSION)"
docker build -f Dockerfile -t "48n6e/shell-exporter:$VERSION" .
docker image push "48n6e/shell-exporter:$VERSION"
