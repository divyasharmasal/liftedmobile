#!/usr/bin/env sh

sh ./scripts/app_server/prod/run_prod.sh

docker-compose -f ./docker/admin_server/docker-compose.prod.yml stop
docker-compose -f ./docker/admin_server/docker-compose.prod.yml up -d

if [ "${1}" != "--no-logs" ]
then
    echo -e "\nView logs at https://ap-southeast-1.console.aws.amazon.com/cloudwatch/home?region=ap-southeast-1#logEventViewer:group=liftedmobile_logs;stream=cms_stream"
fi
