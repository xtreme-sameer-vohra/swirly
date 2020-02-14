#!/bin/bash

if [[ $# -eq 0 ]] ; then
    echo 'Usage: analyze_dumps.sh PATH_TO_DUMP_FILE'
    exit 1
fi

#If this fails, run `npm install -g react-tools` 
jsx src/swirly.js > build/swirly.js

node src/parser-single.js $1
