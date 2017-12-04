# -*- coding: utf-8 -*-
import scrapy
import pytz
import datetime

from ..items import CourseItem


class CalasSpider(scrapy.Spider):
    name = 'calas'
    allowed_domains = ['www.silecpdcentre.sg']
    sile_url = 'https://www.silecpdcentre.sg'
    start_urls = [sile_url + "/calas/"]


    def _extract_id(self, s):
        """
        Given a string like "?EventID=1234", return 1234
        """
        return int(s.split("?EventID=")[1])


    def parse(self, response):
        """
        Submit the form at https://www.silecpdcentre.sg/calas/ to get
        all events from the current date till the last day of the next year.
        """

        viewstate_selector = "input#__VIEWSTATE::attr(value)"
        viewstate = response.css(viewstate_selector).extract_first()

        viewstate_gen_selector = "input#__VIEWSTATEGENERATOR::attr(value)"
        viewstate_gen = response.css(viewstate_gen_selector).extract_first()

        eventvalidation_selector = "input#__EVENTVALIDATION::attr(value)"
        eventvalidation = response.css(eventvalidation_selector).extract_first()
        
        asia_sg = pytz.timezone("Asia/Singapore")
        now = pytz.utc.localize(datetime.datetime.now()).astimezone(asia_sg)

        current_date_str = now.strftime("%d %b %Y")
        next_date_str = datetime.datetime(now.year + 1, 12, 31).strftime("%d %b %Y")

        formdata = {
            "__EVENTTARGET:": "", "__EVENTARGUMENT:": "",
            "__VIEWSTATE": viewstate, "__VIEWSTATEGENERATOR": viewstate_gen,
            "__EVENTVALIDATION": eventvalidation, "site": "global",
            "client": "global", "proxystylesheet": "global",
            "output": "xml_no_dtd", "ie": "utf8", "oe": "utf8",
            "ctl00$ctl08$searchKeyword": "Search Website",
            "ctl00$ContentPlaceHolder1$hdClient": "",
            "ctl00$ContentPlaceHolder1$txtKeywords": "",
            "ctl00$ContentPlaceHolder1$rblFilter": "0",
            "ctl00$ContentPlaceHolder1$ddlMonth": "0",
            "ctl00$ContentPlaceHolder1$ddlTraiingLevel": "All",
            "ctl00$ContentPlaceHolder1$btnSubmit": "Search",
            "ctl00$ContentPlaceHolder1$txtKeywordsMbl": "",
            "ctl00$ContentPlaceHolder1$RadioButtonList1": "0",
            "ctl00$ContentPlaceHolder1$ddlMonthMbl": "0",
            "ctl00$ContentPlaceHolder1$txtMblFromDate": "",
            "ctl00$ContentPlaceHolder1$txtMblToDate": "",
            "ctl00$ContentPlaceHolder1$ddlTraiingLevelmbl": "All",
            "ctl00$ContentPlaceHolder1$txtFromDate": current_date_str,
            "ctl00$ContentPlaceHolder1$txtToDate": next_date_str,
        }

        yield scrapy.FormRequest("https://www.silecpdcentre.sg/calas/",
                                 formdata=formdata,
                                 callback=self.parse_table)


    def parse_table(self, response):
        for path in response.xpath("//dd/a").css("a::attr(href)").extract():
            event_url = self.sile_url + path
            yield scrapy.Request(event_url, callback=self.parse_event_page)


    def convert_to_isodate(self, date):
        d = date.strip()
        if len(d) == 0:
            return None

        timezone = pytz.timezone("Asia/Singapore")
        date_and_time_format = "%A %d %b %Y - %I:%M %p"
        date_format = "%A %d %b %Y"

        try:
            parsed = datetime.datetime.strptime(d, date_and_time_format)
            return timezone.localize(parsed).isoformat()
        except:
            parsed = datetime.datetime.strptime(d, date_format)
            return timezone.localize(parsed).isoformat()


    def parse_event_page(self, response):
        event_id = self._extract_id(response.url)
        name = response.xpath(
            "//span[contains(@id, 'ContentPlaceHolder1_lblEventTitle')]"
            )[0].xpath("text()").extract_first()

        start_date_str = response.xpath(
            "//span[contains(@id, 'ContentPlaceHolder1_lblEventStartDate')]"
            )[0].xpath("text()").extract_first()

        end_date_str = response.xpath(
            "//span[contains(@id, 'ContentPlaceHolder1_lblEventEndDate')]"
            )[0].xpath("text()").extract_first()


        start_date = self.convert_to_isodate(start_date_str)
        end_date = self.convert_to_isodate(end_date_str)

        public_cpd_str = response.xpath(
            "//span[contains(@id, 'ContentPlaceHolder1_lblPublicCPDPoints')]"
            )[0].xpath("text()").extract_first().strip()

        public_cpd = None
        if len(public_cpd_str) > 0:
            public_cpd = float(public_cpd_str)

        provider = response.xpath(
            "//span[contains(@id, 'ContentPlaceHolder1_lblOrganiser')]"
            )[0].xpath("text()").extract_first()

        if provider == "Ad-hoc Accredited CPD Activity Organiser":
            provider = None

        level = response.xpath(
            "//span[contains(@id, 'ContentPlaceHolder1_lblTrainingCategory')]"
            )[0].xpath("text()").extract_first()

        upcoming = start_date is None and end_date is None
        course_item = CourseItem(name=name, url=response.url,
                                 start_date=start_date,
                                 end_date=end_date,
                                 public_cpd=public_cpd,
                                 upcoming=upcoming,
                                 provider=provider,
                                 level=level)
        yield course_item
