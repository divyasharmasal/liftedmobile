#!/usr/bin/env bash

yes | docker-compose -f docker/admin_server/prod/docker-compose.prod.yml stop
yes | docker-compose -f docker/admin_server/prod/docker-compose.prod.yml rm
docker-compose -f docker/admin_server/prod/docker-compose.prod.yml build #--no-cache
docker-compose -f docker/admin_server/prod/docker-compose.prod.yml up -d #--force-recreate
docker logs -f admin_cms

