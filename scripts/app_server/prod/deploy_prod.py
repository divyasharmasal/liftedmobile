#!/usr/bin/env python3

import argparse

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
            description="Deploy the LIFTED Mobile app to a production server.")
    parser.add_argument("-p", "--port", required=True, type=int, metavar="SSH port")
    parser.add_argument("-c", "--cred", required=True, type=str, metavar=".pem file for SSH")
    parser.add_argument("-u", "--userhost", required=True, type=str, metavar="user@host")
    parser.add_argument("-d", "--dc", required=True, type=str, metavar="Production docker-compose file") 
    args = parser.parse_args()
    cred_filepath = args.cred
    port = args.port
    userhost = args.userhost
    dc_filepath = args.dc

    ssh_args = "-p {port} -i '{cred_filepath}' {userhost}"\
            .format(cred_filepath=cred_filepath, port=port, userhost=userhost)
    ssh_command = "ssh " + ssh_args

    scp_command = "scp -p {port} -i '{cred_filepath}' {dc_filepath} {userhost}/"\
            .format(cred_filepath=cred_filepath, port=port, userhost=userhost,
                    dc_filepath=dc_filepath)
    print(ssh_command)
