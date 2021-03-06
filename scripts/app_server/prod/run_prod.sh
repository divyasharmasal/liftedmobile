#!/usr/bin/env sh

docker-compose -f ./docker/app_server/docker-compose.prod.yml stop -t 0
docker-compose -f ./docker/app_server/docker-compose.prod.yml up --no-build -d 

if [ "${1}" != "--no-logs" ]
then
    echo -e "\nView logs at https://ap-southeast-1.console.aws.amazon.com/cloudwatch/home?region=ap-southeast-1#logEventViewer:group=liftedmobile_logs;stream=liftedmobile_stream"
fi
