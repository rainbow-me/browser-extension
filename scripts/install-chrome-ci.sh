#!/bin/sh

apt-get update; apt-get install -y gettext-base;
echo 'deb http://dl.google.com/linux/chrome/deb/ stable main' > /etc/apt/sources.list.d/chrome.list
wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
set -x && apt-get update && apt-get install -y xvfb google-chrome-stable
wget -q -O /usr/bin/xvfb-chrome https://bitbucket.org/atlassian/docker-node-chrome-firefox/raw/ff180e2f16ea8639d4ca4a3abb0017ee23c2836c/scripts/xvfb-chrome
ln -sf /usr/bin/xvfb-chrome /usr/bin/google-chrome