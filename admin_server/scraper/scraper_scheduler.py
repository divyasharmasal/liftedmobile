import schedule
import time
import datetime
import requests
import subprocess

def timestamp():
    """
    Returns the ISO-formatted timestamp of the current UTC date and time.
    """
    return datetime.datetime.utcnow().isoformat() + " UTC"


def _log(msg):
    """
    Print the current time and a message.
    """
    print(timestamp(), msg)


def run_all_scrapes():
    """
    Make HTTP POST requests to the scrapyd API to schedule (run) all scrape
    jobs.
    """
    _log("Running all scrapes...")

    spiders = ["sal"]
    payloads = [{"project": "scraper", "spider": spider} for spider in spiders]

    for payload in payloads:
        _log("Scheduling spider {spider}".format(spider=payload["spider"]))
        requests.post("http://localhost:6800/schedule.json", data=payload)

    _log("Done.")


if __name__ == "__main__":
    # Wait for the scrapyd process to start
    _log("Waiting for scrapyd...")
    while True:
        try:
            if requests.get("http://localhost:6800").ok:
                break
        except:
            time.sleep(0.25)
    _log("scrapyd is running")

    # Run scrapyd-deploy
    command = "cd /scraper && scrapyd-deploy"

    subprocess.run(command, shell=True)
    _log("Ran {command}".format(command=command))

    run_all_scrapes()
    _log("Ran first scrape")

    schedule.every(2).hours.do(run_all_scrapes)

    while True:
        schedule.run_pending()
        time.sleep(1)
