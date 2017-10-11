#!/usr/bin/env bash

if [ "${1}" == "deploy" ]
then
    gulp deploy --gulpfile src/frontend/gulpfile.js
else
    gulp --gulpfile src/frontend/gulpfile.js
fi

