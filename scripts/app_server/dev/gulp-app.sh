#!/usr/bin/env bash

if [ "${1}" == "deploy" ]
then
    gulp deploy --gulpfile src/lm/app/frontend/gulpfile.js
else
    gulp --gulpfile src/lm/app/frontend/gulpfile.js
fi

