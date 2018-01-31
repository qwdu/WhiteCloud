#!/bin/sh

DATA_PATH_HOME="/storage/home"
DATA_PATH_PUBLIC="/storage/public"

ln -sf $DATA_PATH_HOME home
ln -sf $DATA_PATH_PUBLIC public
mkdir -p home/admin

node app.js
