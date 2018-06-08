#!/usr/bin/env python3

import argparse
import os
import subprocess

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
            description="Deploy the LIFTED Mobile app to a production server.")
    parser.add_argument("-p", "--port", required=True, type=int,
                        metavar="SSH port")
    parser.add_argument("-c", "--cred", required=True, type=str,
                        metavar=".pem file for SSH")
    parser.add_argument("-u", "--userhost", required=True, type=str,
                        metavar="user@host")
    parser.add_argument("-s", "--scripts-docker-dir", required=True, type=str,
                        metavar="Location of the parent directory of the "
                                "scripts/ and docker/ directories")
    parser.add_argument("-d", "--dry-run", action="store_true")
    parser.add_argument("-t", "--type", required=True, type=str,
                        metavar="Provide \"app\" or \"cms\" to deploy the "
                                "app or CMS respectively")

    args = parser.parse_args()
    cred_filepath = args.cred
    port = args.port
    userhost = args.userhost
    scripts_docker_dir = args.scripts_docker_dir
    dry_run = args.dry_run
    deploy_type = args.type

    ssh_args = "-p {port} -i '{cred_filepath}' {userhost}"\
        .format(cred_filepath=cred_filepath, port=port, userhost=userhost)

    ssh_command = "ssh " + ssh_args

    # TODO: relative path
    scripts_path = os.path.join(scripts_docker_dir, "scripts")
    docker_path = os.path.join(scripts_docker_dir, "docker")

    rmdir_command = ssh_command + " \"rm -rf ~/liftedmobile\""
    mkdir_command = ssh_command + " \"mkdir -p ~/liftedmobile\""

    scp_command = "scp -q -P {port} -i '{cred_filepath}' -r {scripts} {docker} {userhost}:~/liftedmobile"\
        .format(cred_filepath=cred_filepath, port=port,
            userhost=userhost, scripts=scripts_path, docker=docker_path)

    run_command = None
    push_command = None
    if deploy_type.strip().lower() == "app":
        push_command = "sh ./scripts/app_server/prod/push_prod.sh '" + ssh_command + "'"
        run_command = ssh_command + \
            " \"cd liftedmobile && ./scripts/app_server/prod/run_prod.sh\""
    elif deploy_type.strip().lower() == "cms":
        push_command = "sh ./scripts/admin_server/prod/push_prod.sh '" + ssh_command + "'"
        run_command = ssh_command + \
            " \"cd liftedmobile && ./scripts/admin_server/prod/run_prod.sh --only-admin\""
    else:
        raise Exception("The -t/--type command-line flag should be "
                        "either \"app\" or \"cms\"")

    if dry_run:
        print(rmdir_command)
        print(mkdir_command)
        print(scp_command)
        print(push_command)
        print(run_command)
    else:
        print(rmdir_command)
        subprocess.check_call(mkdir_command, shell=True)

        print(mkdir_command)
        subprocess.check_call(mkdir_command, shell=True)

        print(scp_command)
        subprocess.check_call(scp_command, shell=True)

        print(push_command)
        subprocess.check_call(push_command, shell=True)

        print(run_command)
        subprocess.check_call(run_command, shell=True)
