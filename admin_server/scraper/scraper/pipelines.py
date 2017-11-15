# -*- coding: utf-8 -*-

# Define your item pipelines here
#
# Don't forget to add your pipeline to the ITEM_PIPELINES setting
# See: http://doc.scrapy.org/en/latest/topics/item-pipeline.html

import os
import json
import requests
import datetime
import pytz
from scraper import settings


class ScraperPipeline(object):
    def convert_to_isodate(self, date):
        """
        Convert a datestring like "01 Nov 2017" to a
        Asia/Singapore ISO datetime string.
        """

        d = datetime.datetime.strptime(date, "%d %b %Y")
        tz = pytz.timezone("Asia/Singapore")

        return tz.localize(d, is_dst=None).isoformat()


    def process_item(self, item, spider):
        # Do nothing if NOPUSH is in ENV. This helps with debugging via
        # manually running scrapy crawl; i.e.:
        # $ NOPUSH=1 DEV=true SCRAPYD_API_KEY=scrapyapikey scrapy crawl sal
        if "NOPUSH" in os.environ:
            return item

        start_date = item["start_date"]
        end_date = item["end_date"]

        if start_date is not None:
            start_date = self.convert_to_isodate(start_date)

        if end_date is not None:
            end_date = self.convert_to_isodate(end_date)

        item_dict = {
            "name": item["name"],
            "url": item["url"],
            "start_date": start_date,
            "end_date": end_date,
            "upcoming": item["upcoming"],
        }

        payload = {
            "k": settings.SCRAPYD_API_KEY,
            "c": json.dumps(item_dict)
        }

        post_res = requests.post(
            "http://cms:9000/cms/scraper/sal/add_course/", data=payload)
        print(post_res.json())

        # This can be run in the admin_scrapyd_dev container to schedule
        # (launch) a job:
        # curl http://localhost:6800/schedule.json -d project=scraper -d spider=sal

        return item
