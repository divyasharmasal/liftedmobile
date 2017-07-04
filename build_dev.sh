#!/bin/sh
yes | docker-compose -f docker/docker-compose.dev.yml stop 
yes | docker-compose -f docker/docker-compose.prod.yml stop
yes | docker-compose -f docker/docker-compose.dev.yml rm
yes | docker-compose -f docker/docker-compose.prod.yml rm
docker-compose -f docker/docker-compose.dev.yml build 
docker-compose -f docker/docker-compose.dev.yml up -d

#echo
#echo "Docker containers are up. Logs from liftedmobile_dev:"
#echo
docker logs -f liftedmobile_dev
