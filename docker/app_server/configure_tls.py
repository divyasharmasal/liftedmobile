#!/usr/bin/env python3

"""
Configures TLS for this Nginx reverse proxy.
"""

import subprocess
import requests
import time
import json


def read_secret(secret_name):
    return open("/run/secrets/" + secret_name).read()


if __name__ == "__main__":
    config = json.loads(read_secret("certbot_config"))
    if "run_certbot" in config and config["run_certbot"]:
        print("Waiting for the app HTTP server to start...")
        while True:
            try:
                requests.get("http://liftedmobile:8001")
                break
            except:
                time.sleep(0.5)

        email = config["email"]
        domain = config["domain"]

        command = (
            "certbot -a webroot -i nginx --agree-tos "
            "-m {email} --no-eff-email --keep-until-expiring "
            "-d {domain} --non-interactive --webroot-path "
            "/certbot_webroot --redirect --staging"
                .format(email=email, domain=domain))

        print("Using Certbot to update Nginx")
        r = subprocess.run(command, shell=True, stderr=subprocess.STDOUT)
        print(r.stdout)
    else:
        print("Not running certbot because run_certbot is either False or "
              "missing in certbot_config")


#certbot -a webroot -i nginx --agree-tos -m EMAIL --no-eff-email -d app.lifted.sg --non-interactive --webroot-path /certbot_webroot --redirect --keep-until-expiring --staging

    # Redirect non-https traffic to https
    # if ($scheme != "https") {
    #     return 301 https://$host$request_uri;
    # } # managed by Certbot

