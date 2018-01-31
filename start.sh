#!/bin/sh

DATA_PATH_HOME="/storage/home"
DATA_PATH_PUBLIC="/storage/public"
DATA_PATH_TMP="/storage/tmp"

echo "data home = " $DATA_PATH_HOME
echo "data public = " $DATA_PATH_PUBLIC
echo "data tmp = " $DATA_PATH_TMP_

ln -sf $DATA_PATH_HOME home
ln -sf $DATA_PATH_PUBLIC public
ln -sf $DATA_PATH_TMP tmp

mkdir -p home/admin

node app.js
