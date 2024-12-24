#!/bin/bash
NETWORK=$1
KEY=$(grep ALCHEMY_DEV_KEY .env | cut -d '=' -f2)

case $NETWORK in
  "optimism")
    echo "https://opt-mainnet.g.alchemy.com/v2/$KEY"
    ;;
  "mainnet")
    echo "https://eth-mainnet.g.alchemy.com/v2/$KEY"
    ;;
esac