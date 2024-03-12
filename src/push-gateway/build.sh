#!/bin/sh

VERSION="$(cat VERSION)"
docker build -f Dockerfile -t "48n6e/push-gateway:$VERSION" .
 docker image push "48n6e/push-gateway:$VERSION"
