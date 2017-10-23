#!/usr/bin/env bash

yes | docker-compose -f docker/admin_server/dev/docker-compose.dev.yml stop
yes | docker-compose -f docker/admin_server/dev/docker-compose.dev.yml rm
docker-compose -f docker/admin_server/dev/docker-compose.dev.yml build #--no-cache
docker-compose -f docker/admin_server/dev/docker-compose.dev.yml up -d #--force-recreate
docker logs -f admin_cms_dev

