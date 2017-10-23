#!/usr/bin/env bash

if [ "${1}" == "deploy" ]
then
    gulp deploy --gulpfile admin_server/cms/frontend/gulpfile.js
else
    gulp --gulpfile admin_server/cms/frontend/gulpfile.js
fi
