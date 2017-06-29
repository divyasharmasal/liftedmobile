#!/bin/sh
yes | docker-compose -f docker/docker-compose.prod.yml rm
docker-compose -f docker/docker-compose.prod.yml build --no-cache
docker-compose -f docker/docker-compose.prod.yml up -d --force-recreate

echo
echo "Docker containers are up. Logs from liftedmobile:"
echo
docker logs -f liftedmobile
