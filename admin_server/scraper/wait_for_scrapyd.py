"""
Run this script with the scrapyd URL as the first command-line argument,
and it will do nothing until the said URL can be resolved into some output.
"""

from urllib import request
import time
import sys

if __name__ == "__main__":
    print("Waiting for scrapyd to start...")
    while True:
        try:
            request.urlopen(sys.argv[1])
            break
        except:
            time.sleep(0.25)
