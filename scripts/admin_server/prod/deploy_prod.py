#!/usr/bin/env python3

import argparse
import os

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
            description="Deploy the LIFTED Mobile app to a production server.")
    parser.add_argument("-p", "--port", required=True, type=int, metavar="SSH port")
    parser.add_argument("-c", "--cred", required=True, type=str, metavar=".pem file for SSH")
    parser.add_argument("-u", "--userhost", required=True, type=str, metavar="user@host")
    parser.add_argument("-s", "--scripts-docker-dir", required=True, type=str, 
        metavar="Location of scripts/ and docker/ directories")

    args = parser.parse_args()
    cred_filepath = args.cred
    port = args.port
    userhost = args.userhost
    scripts_docker_dir = args.scripts_docker_dir

    ssh_args = "-p {port} -i '{cred_filepath}' {userhost}"\
        .format(cred_filepath=cred_filepath, port=port, userhost=userhost)

    ssh_command = "ssh " + ssh_args

    # TODO: relative path
    scripts_path = os.path.join("scripts")
    docker_path = os.path.join("docker")

    push_command = "sh ./scripts/admin_server/prod/push_prod.sh '" + ssh_command + "'"
    mkdir_command = ssh_command + " \"mkdir -p ~/run\""

    scp_command = "scp -q -P {port} -i '{cred_filepath}' -r {scripts} {docker} {userhost}:~/run"\
        .format(cred_filepath=cred_filepath, port=port,
            userhost=userhost, scripts=scripts_path, docker=docker_path)

    run_command = ssh_command + \
        " \"cd run && ./scripts/admin_server/prod/run_prod.sh --only-admin\""

    print(mkdir_command)
    print(scp_command)
    print(push_command)
    print(run_command)
