#!/bin/sh

yes | docker-compose -f docker/app_server/docker-compose.dev.yml stop 
yes | docker-compose -f docker/app_server/docker-compose.dev.yml rm
docker-compose -f docker/app_server/docker-compose.dev.yml build 
docker-compose -f docker/app_server/docker-compose.dev.yml up -d

if [ "${1}" != "--no-logs" ]
then
    echo
    echo "Logs from the liftedmobile_dev Docker container:"
    echo
    docker logs -f liftedmobile_dev
fi
