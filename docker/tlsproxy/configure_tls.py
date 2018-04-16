#!/usr/bin/env python3

"""
Configures TLS for this Nginx reverse proxy.
"""

import subprocess
import requests
import time
import json
import os


if __name__ == "__main__":
    config = json.loads(open("/run/secrets/secrets").read())["certbot_config"]
    host = config["host"]
    nginx_conf = "/etc/nginx/nginx.conf"

    if "run_certbot" in config and config["run_certbot"]:

        print("Waiting for the app HTTP server to start...")

        while True:
            try:
                requests.get("http://" + host + ":8001")
                break
            except:
                time.sleep(0.5)

        email = config["email"]
        domain = config["domain"]
        http_port = config["http_port"]
        aws_access_key = config["access_key_id"]
        aws_secret_key = config["secret_access_key"]

        command = (
            "certbot -i nginx --agree-tos "
            "-m {email} --no-eff-email --keep-until-expiring "
            "-d {domain} --non-interactive --redirect "
            "--preferred-challenges=dns --dns-route53 "
                .format(email=email, domain=domain, http_port=http_port))


        env = os.environ.copy()
        env["AWS_ACCESS_KEY_ID"] = aws_access_key
        env["AWS_SECRET_ACCESS_KEY"] = aws_secret_key

        print("Using Certbot to update Nginx")
        r = subprocess.Popen(command,
                shell=True,
                stderr=subprocess.STDOUT,
                env=env)

        print(r.stdout)
    else:
        print("Not running certbot because run_certbot is either False or "
              "missing in certbot_config")


#certbot -a webroot -i nginx --agree-tos -m EMAIL --no-eff-email -d app.lifted.sg --non-interactive --webroot-path /certbot_webroot --redirect --keep-until-expiring --staging

    # Redirect non-https traffic to https
    # if ($scheme != "https") {
    #     return 301 https://$host$request_uri;
    # } # managed by Certbot

