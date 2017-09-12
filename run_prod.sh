#!/usr/bin/env bash
docker-compose -f docker/docker-compose.prod.yml up -d

echo
echo "View logs at https://ap-southeast-1.console.aws.amazon.com/cloudwatch/home?region=ap-southeast-1#logEventViewer:group=liftedmobile_logs;stream=liftedmobile_stream"
echo
