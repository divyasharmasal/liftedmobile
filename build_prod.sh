#!/bin/sh
yes | docker-compose -f docker/docker-compose.dev.yml stop 
yes | docker-compose -f docker/docker-compose.prod.yml stop
yes | docker-compose -f docker/docker-compose.dev.yml rm
yes | docker-compose -f docker/docker-compose.prod.yml rm
docker-compose -f docker/docker-compose.prod.yml build --no-cache
docker-compose -f docker/docker-compose.prod.yml up -d --force-recreate

echo
echo "Logs from the liftedmobile Docker container:"
echo
docker logs -f liftedmobile
