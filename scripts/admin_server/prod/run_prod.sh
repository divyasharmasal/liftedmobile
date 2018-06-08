#!/usr/bin/env sh

if [ "${1}" != "--only-admin" ]
then
    sh ./scripts/app_server/prod/run_prod.sh
fi

docker-compose -f ./docker/admin_server/docker-compose.prod.yml stop -t 0
docker-compose -f ./docker/admin_server/docker-compose.prod.yml up --no-build -d

if [ "${1}" != "--no-logs" ]
then
    echo -e "\nView logs at https://ap-southeast-1.console.aws.amazon.com/cloudwatch/home?region=ap-southeast-1#logEventViewer:group=liftedmobile_logs;stream=cms_stream"
fi
