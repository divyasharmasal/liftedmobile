#!/usr/bin/env sh

setcap cap_ipc_lock=-ep $(readlink -f $(which vault))
nohup vault server -dev -dev-listen-address=0.0.0.0:9333 -log-level=err &
sleep 3

export VAULT_ADDR='http://0.0.0.0:9333'
vault token-create -use-limit=1

while sleep 3600; do :; done
