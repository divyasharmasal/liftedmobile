#!/usr/bin/env bash

if [ "${1}" == "deploy" ]
then
    gulp deploy --gulpfile src/lm/cms/frontend/gulpfile.js
else
    gulp --gulpfile src/lm//cms/frontend/gulpfile.js
fi
