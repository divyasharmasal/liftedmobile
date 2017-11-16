#!/usr/bin/env bash

if [ -z "${1}" ]
then
    echo "Usage: ./push_prod.sh \"<ssh command>\""
    echo "Example: ./push_prod.sh \"ssh -p 2233 -i '/path/to/liftedmobile.pem' ubuntu@52.221.77.72\""
else
    eval "docker save adminserver_db      | bzip2 | pv | ${1} 'bunzip2 | docker load'"
    eval "docker save adminserver_cms     | bzip2 | pv | ${1} 'bunzip2 | docker load'"
    eval "docker save adminserver_scrapyd | bzip2 | pv | ${1} 'bunzip2 | docker load'"
fi
