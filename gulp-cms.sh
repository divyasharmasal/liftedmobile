#!/usr/bin/env bash

if [ "${1}" == "deploy" ]
then
    gulp deploy --gulpfile src/cms/gulpfile.js
else
    gulp --gulpfile src/cms/gulpfile.js
fi

