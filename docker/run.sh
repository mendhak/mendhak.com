#!/bin/bash

echo "Starting memcached"
service memcached start

cd /src
echo "Installing dependencies"
npm install
echo "Starting site"
npm start