#!/bin/sh

echo "Launching the app server..."
sh scripts/app_server/dev/build_dev.sh --no-logs

echo "Launching the admin server..."
yes | docker-compose -f docker/admin_server/docker-compose.dev.yml stop
yes | docker-compose -f docker/admin_server/docker-compose.dev.yml rm
docker-compose -f docker/admin_server/docker-compose.dev.yml build #--no-cache
docker-compose -f docker/admin_server/docker-compose.dev.yml up -d #--force-recreate

if [ "${1}" != "--no-logs" ]
then
    echo
    echo "Logs from the admin_cms_dev Docker container:"
    echo
    docker logs -f admin_cms_dev
fi
