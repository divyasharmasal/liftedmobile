#!/usr/bin/env python3

import os
import argparse
import datetime
import schedule

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Schedule and run database backups")

    parser.add_argument("--container",
            required=True,
            type=str,
            metavar="Name of the container running Django")

    parser.add_argument("--hours",
            required=False,
            default=24,
            type=str,
            metavar="Interval between backups")

    args = parser.parse_args()
    container = args.container
    hours = args.hours
