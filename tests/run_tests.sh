#!/bin/sh
yes | docker-compose -f docker-compose.yml stop
yes | docker-compose -f docker-compose.yml rm
docker-compose -f docker-compose.yml build #--no-cache
docker-compose -f docker-compose.yml up -d #--force-recreate

echo
echo "Logs from the liftedmobile_tests Docker container:"
echo
docker logs -f liftedmobile_tests

