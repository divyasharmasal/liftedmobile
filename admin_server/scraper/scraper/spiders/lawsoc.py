# -*- coding: utf-8 -*-
import scrapy
import pytz
import datetime

from ..items import CourseItem


def parse_dates_str(dates_str):
    dt_format_str = "%d/%m/%Y %H:%M"
    d_format_str = "%d/%m/%Y"
    t_format_str = "%H:%M"
    start_date = end_date = None

    if "-" in dates_str:
        dates = [x.strip() for x in dates_str.split("-")]
        start_date_str = dates[0]
        end_date_str = dates[1]

        try:
            start_date = datetime.datetime.strptime(
                start_date_str, dt_format_str)
        except:
            start_date = datetime.datetime.strptime(
                start_date_str, d_format_str)

        try:
            try:
                end_date = datetime.datetime.strptime(
                    end_date_str, dt_format_str)
            except:
                end_date = datetime.datetime.strptime(
                    end_date_str, d_format_str)
        except:
            try:
                end_date = (datetime.datetime.strptime(
                    end_date_str, t_format_str)
                            .replace(
                                year=start_date.year,
                                month=start_date.month,
                                day=start_date.day)
                )
            except:
                pass
    else:
        try:
            start_date = datetime.datetime.strptime(dates_str, dt_format_str)
        except:
            try:
                start_date = datetime.datetime.strptime(dates_str, d_format_str)
            except:
                pass

    timezone = pytz.timezone("Asia/Singapore")
    if start_date is not None:
        start_date = timezone.localize(start_date).isoformat()
    if end_date is not None:
        end_date = timezone.localize(end_date).isoformat()

    return start_date, end_date


class LawsocSpider(scrapy.Spider):
    name = 'lawsoc'
    allowed_domains = ['www.lawsoc.org.sg']
    start_urls = ['http://www.lawsoc.org.sg/en-gb/events.aspx']

    def parse(self, response):
        links = response.xpath("//div[contains(@class, 'evtBarBtn')]/span/a")
        cal_url = links[0].css("a::attr(href)").extract_first()

        event_links = (
            response.xpath("//span[contains(@class, 'ListTitle')]/a")
                        .css("a::attr(href)").extract())
        # print(event_links)
        # import pdb; pdb.set_trace()

        for link in event_links:
            yield scrapy.Request(link, callback=self.parse_event_page)

        yield scrapy.Request(cal_url, callback=self.parse_cal_page)


    def parse_cal_page(self, response):
        for row in response.xpath("//tr"):
            span_text = row.xpath("td/span/text()").extract_first()
            if (span_text is not None and
                    "all events" in span_text.lower()):

                href = row.xpath("td/a/@href").extract_first()
                if "/feed.aspx?" in href:
                    yield scrapy.Request(href, callback=self.parse_feed)


    def parse_feed(self, response):
        for href in response.xpath("//item/link/text()").extract():
            yield scrapy.Request(href, callback=self.parse_event_page)


    def parse_event_page(self, response):
        name = response.xpath("//span[@class='ListTitle']/a/text()").extract_first()

        reg_closed_str = "[Registration Closed]"
        if name.startswith(reg_closed_str):
            name = name.replace(reg_closed_str, "").strip()

        dates_str = response.xpath("//span[@class='ListEventDate']/a/text()").extract_first()
        start_date, end_date = parse_dates_str(dates_str)

        cpd_candidates = response.xpath("//div[@class='ListContent']/p") \
            .xpath("string()").extract()

        public_cpd = None

        for public_cpd_str in cpd_candidates:
            if "cpd points:" in public_cpd_str.lower():
                public_cpd = None
                try:
                    public_cpd = float(public_cpd_str.split(":")[1])
                except:
                    pass
                break


        upcoming = start_date is None and end_date is None
        course_item = CourseItem(name=name, url=response.url,
                                 start_date=start_date,
                                 end_date=end_date,
                                 public_cpd=public_cpd,
                                 provider=None,
                                 level=None,
                                 upcoming=upcoming)
        yield course_item


if __name__ == "__main__":
    a = "23/11/2017 08:30 - 24/11/2017 18:00"
    b = "28/11/2017 12:30 - 13:45"
    c = "28/11/2017"
    print(parse_dates_str(a))
    print(parse_dates_str(b))
    print(parse_dates_str(c))
