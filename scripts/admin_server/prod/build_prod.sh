#!/bin/sh

echo "Launching the app server..."
sh scripts/app_server/prod/build_prod.sh --no-logs

yes | docker-compose -f docker/admin_server/docker-compose.prod.yml stop
yes | docker-compose -f docker/admin_server/docker-compose.prod.yml rm
docker-compose -f docker/admin_server/docker-compose.prod.yml build --no-cache
docker-compose -f docker/admin_server/docker-compose.prod.yml up -d --force-recreate

if [ "${1}" != "--no-logs" ]
then
    echo
    echo "View logs at https://ap-southeast-1.console.aws.amazon.com/cloudwatch/home?region=ap-southeast-1#logEventViewer:group=liftedmobile_logs;stream=cms_stream"
fi
