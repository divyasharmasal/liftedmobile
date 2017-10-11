#!/bin/sh
yes | docker-compose -f docker/docker-compose.prod.yml stop
yes | docker-compose -f docker/docker-compose.prod.yml rm
docker-compose -f docker/docker-compose.prod.yml build --no-cache
docker-compose -f docker/docker-compose.prod.yml up -d --force-recreate

echo
echo "View logs at https://ap-southeast-1.console.aws.amazon.com/cloudwatch/home?region=ap-southeast-1#logEventViewer:group=liftedmobile_logs;stream=liftedmobile_stream"
#docker logs -f liftedmobile
