#!/usr/bin/env python3

import time
import subprocess
from lm import settings

if __name__ == "__main__":
    for config_name, config in settings.DATABASES.items():
        username = config["USER"]
        db_name = config["NAME"]
        host = config["HOST"]
        port = config["PORT"]

        command = ("pg_isready -q -h {host} -p {port} -U {username}"
                    .format(host=host, port=port, username=username))

        print("Waiting for database {host}...".format(host=host))
        while True:
            r = subprocess.run(command, shell=True)
            if r.returncode == 0:
                break
            time.sleep(0.5)
