#!/bin/sh

DATA_PATH="/storage"
echo "data path = " $DATA_PATH

rm -f storage
ln -sf $DATA_PATH storage

mkdir -p storage/tmp
[ -e storage/home/admin ] || mkdir -p storage/home/admin
[ -f storage/home/admin/.config.json ] || cp -f user.admin.json storage/home/admin/.config.json

node app.js
