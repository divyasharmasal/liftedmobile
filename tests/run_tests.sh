#!/bin/sh
yes | docker-compose -f docker-compose.yml stop
yes | docker-compose -f docker-compose.yml rm
docker network create -d bridge --subnet 192.168.222.0/24 --gateway 192.168.222.1 liftedmobile_test_dockernet
docker-compose -f docker-compose.yml build #--no-cache
docker-compose -f docker-compose.yml up -d #--force-recreate

echo
echo "Logs from the liftedmobile_tests Docker container:"
echo
docker logs -f liftedmobile_tests

