# -*- coding: utf-8 -*-

# Define your item pipelines here
#
# Don't forget to add your pipeline to the ITEM_PIPELINES setting
# See: http://doc.scrapy.org/en/latest/topics/item-pipeline.html

import os
import json
import requests
import datetime
import socket
import pytz
from scraper import settings


class ScraperPipeline(object):
    def __init__(self):
        self.urls = []

        cms_host = None
        if "DEV" in os.environ and os.environ["DEV"]:
            cms_host = socket.gethostbyname("cms_dev")
        else:
            cms_host = socket.gethostbyname("cms")

        self.sync_urls_url = "http://" + cms_host + ":9000/cms/scraper/sync_urls/"
        self.add_course_url = "http://" + cms_host + ":9000/cms/scraper/add_course/"

    def close_spider(self, spider):
        payload = {
            "k": settings.SCRAPYD_API_KEY,
            "urls": json.dumps(self.urls),
            "spider": spider.name
        }

        url = self.sync_urls_url

        post_res = requests.post(self.sync_urls_url, data=payload)
        if post_res.ok:
            print(post_res.json())
        else:
            print("POST request to {url} failed.".format(url=url))
            print(post_res.status_code, post_res.text)

        self.urls = []


    def process_item(self, item, spider):
        self.urls.append(item["url"])
        # Do nothing if NOPUSH is in ENV. This helps with debugging via
        # manually running scrapy crawl; i.e.:
        # $ NOPUSH=1 DEV=true SCRAPYD_API_KEY=scrapyapikey scrapy crawl sal
        if "NOPUSH" in os.environ:
            return item

        payload = {
            "k": settings.SCRAPYD_API_KEY,
            "c": json.dumps(dict(item)),
            "spider_name": spider.name,
        }

        url = self.add_course_url
        post_res = requests.post(url, data=payload)
        if post_res.ok:
            print(post_res.json())
        else:
            print("POST request to {url} failed.".format(url=url))
            print(post_res.status_code, post_res.text)

        # This can be run in the admin_scrapyd_dev container to schedule
        # (launch) a job:
        # curl http://localhost:6800/schedule.json -d project=scraper -d spider=sal

        return item
