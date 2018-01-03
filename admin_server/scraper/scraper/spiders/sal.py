# -*- coding: utf-8 -*-
import scrapy
import pytz
import datetime

from ..items import CourseItem

class SalSpider(scrapy.Spider):
    name = 'sal'
    allowed_domains = ['www.sal.org.sg']
    start_urls = ['https://www.sal.org.sg/Events/View-All-Events/Date-Desc']


    def convert_to_isodate(self, date):
        """
        Convert a datestring like "01 Nov 2017" to a
        Asia/Singapore ISO datetime string.
        """
        if date is None:
            return None

        d = datetime.datetime.strptime(date, "%d %b %Y")
        tz = pytz.timezone("Asia/Singapore")

        return tz.localize(d, is_dst=None).isoformat()


    def parse(self, response):
        items = []

        for item in response.css(".list-item"):
            name = item.css(".Title::text").extract_first()
            url = item.css("a::attr(href)").extract_first()
            start_date = item.css(".startDate::text").extract_first()
            end_date = item.css(".endDate::text").extract_first()
            upcoming = start_date is None and end_date is None

            if url.startswith("/"):
                url = "https://www.sal.org.sg" + url

            if start_date == end_date:
                end_date = None

            course_item = CourseItem(
                name=name,
                url=url,
                public_cpd=None,
                date_ranges=[{
                    "start": self.convert_to_isodate(start_date),
                    "end": self.convert_to_isodate(end_date),
                }],
                cost=None,
                upcoming=upcoming,
                level=None,
                provider="Singapore Academy of Law")

            items.append(course_item)

        return items
