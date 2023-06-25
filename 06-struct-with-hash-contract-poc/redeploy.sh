#!/bin/bash

npm run build

node build/src/redeploy.js brk1
