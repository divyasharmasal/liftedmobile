# -*- coding: utf-8 -*-
import scrapy

from ..items import CourseItem

class SalSpider(scrapy.Spider):
    name = 'sal'
    allowed_domains = ['sal.org.sg']
    start_urls = ['http://sal.org.sg/Events/View-All-Events/Date-Desc#']

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

            course_item = CourseItem(name=name, url=url,
                                     start_date=start_date,
                                     end_date=end_date,
                                     upcoming=upcoming)
            items.append(course_item)

        return items
