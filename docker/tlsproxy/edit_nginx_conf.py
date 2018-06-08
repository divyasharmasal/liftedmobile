#!/usr/bin/env python3

"""
Edits /etc/nginx/nginx.conf
"""

import json


if __name__ == "__main__":
    config = json.loads(open("/run/secrets/secrets").read())["certbot_config"]
    host = config["host"]
    domain = config["domain"]

    nginx_conf = "/etc/nginx/nginx.conf"

    c = open(nginx_conf).read().replace("<HOST_NAME>", host) \
        .replace("<SERVER_NAME>", domain)

    with open(nginx_conf, "w") as f:
        f.write(c)
