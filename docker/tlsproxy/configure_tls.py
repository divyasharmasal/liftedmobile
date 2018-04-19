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
        aws_access_key = config["access_key_id"]
        aws_secret_key = config["secret_access_key"]

        command = (
            "certbot -i nginx --agree-tos "
            "-m {email} --no-eff-email --keep-until-expiring "
            "-d {domain} --non-interactive --redirect "
            "--preferred-challenges=dns --dns-route53 "
            .format(email=email, domain=domain))

        env = os.environ.copy()
        env["AWS_ACCESS_KEY_ID"] = aws_access_key
        env["AWS_SECRET_ACCESS_KEY"] = aws_secret_key

        print("Using Certbot to update Nginx")
        r = subprocess.Popen(command,
                             shell=True,
                             stderr=subprocess.STDOUT,
                             env=env)

        print(r.stdout)

        print("Scheduling cron job")
        renew_command = (
            "python3 -c 'import random; "
            "import time; time.sleep(random.random()"
            " * 3600)' && echo 'Running certbot renew' && "
            "certbot renew"
        )

        cron_file = "/etc/periodic/hourly/certbot_renew.sh"
        
        with open(cron_file, "w") as f:
            f.write(renew_command)

        # make the file executable
        st = os.stat(cron_file)
        os.chmod(cron_file, st.st_mode | 0o111)
    else:
        print("Not running certbot because run_certbot is either False or "
              "missing in certbot_config")
