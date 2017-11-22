# -*- coding: utf-8 -*-
import scrapy
import pytz
import datetime


class CalasSpider(scrapy.Spider):
    name = 'calas'
    allowed_domains = ['www.silecpdcentre.sg']
    calas_url = 'https://www.silecpdcentre.sg/calas/'
    start_urls = [calas_url]


    def _extract_id(self, s):
        return int(s.split("?EventID=")[1])


    def parse(self, response):
        now = datetime.datetime.now
        current_date_str = pytz.utc.localize(now).astimezone(
            pytz.timezone("Asia/Singapore")
        ).strftime("%d %b %Y")

        viewstate = response.css('input#__VIEWSTATE::attr(value)').extract_first()
        viewstate_gen = response.css('input#__VIEWSTATEGENERATOR::attr(value)').extract_first()
        eventvalidation = response.css('input#__EVENTVALIDATION::attr(value)').extract_first()
        formdata = {
                "__EVENTTARGET:": "",
                "__EVENTARGUMENT:": "",
                "__VIEWSTATE": viewstate,
                "__VIEWSTATEGENERATOR": viewstate_gen,
                "__EVENTVALIDATION": eventvalidation,
                "site": "global",
                "client": "global",
                "proxystylesheet": "global",
                "output": "xml_no_dtd",
                "ie": "utf8",
                "oe": "utf8",
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
                "ctl00$ContentPlaceHolder1$txtMblFromDate": ""
                "ctl00$ContentPlaceHolder1$txtMblToDate": "",
                "ctl00$ContentPlaceHolder1$ddlTraiingLevelmbl": "All",
                "ctl00$ContentPlaceHolder1$txtFromDate": "22 Nov 2017",
                "ctl00$ContentPlaceHolder1$txtToDate": "31 Dec 2018",
        }
        yield scrapy.FormRequest("https://www.silecpdcentre.sg/calas/",
                                 formdata=formdata,
                                 callback=self.parse_table)


    def parse_table(self, response):
        print(response.xpath("//dt").extract())
        import pdb; pdb.set_trace()

    # def parse(self, response):
        # first_item = response.xpath("//dd/a")[0]
        # url = first_item.css("a::attr(href)").extract_first()
        # first_id = self._extract_id(url)

        # id = first_id
        # prefix = "https://www.silecpdcentre.sg/EventDetails/?EventID="
        # event_url = prefix + str(id)

        # request = scrapy.Request(event_url, callback=self.parse_event_page)
        # yield request

    # def parse_event_page(self, response):
        # event_id = self._extract_id(response.url)
        # title = response.xpath(
            # "//span[contains(@id, 'ContentPlaceHolder1_lblEventTitle')]"
            # )[0].xpath("text()").extract_first()

        # start_date_str = response.xpath(
            # "//span[contains(@id, 'ContentPlaceHolder1_lblEventStartDate')]"
            # )[0].xpath("text()").extract_first()

        # end_date_str = response.xpath(
            # "//span[contains(@id, 'ContentPlaceHolder1_lblEventEndDate')]"
            # )[0].xpath("text()").extract_first()

        # def convert_date(d):
            # timezone = pytz.timezone("Asia/Singapore")
            # return timezone.localize(datetime.datetime.strptime(
                # d, "%A %d %b %Y - %I:%M %p"))

        # start_date = convert_date(start_date_str)
        # end_date = convert_date(end_date_str)

        # pub_cpd_str = response.xpath(
            # "//span[contains(@id, 'ContentPlaceHolder1_lblPublicCPDPoints')]"
            # )[0].xpath("text()").extract_first()

        # public_cpd = None

        # if len(pub_cpd_str.strip()) > 0:
            # public_cpd = float(pub_cpd_str)

            # # prefix = "https://www.silecpdcentre.sg/EventDetails/?EventID="
            # # event_url = prefix + str(event_id - 1)
            # # request = scrapy.Request(event_url, callback=self.parse_event_page)
            # # yield request
        # # else:
            # # print(title, start_date, end_date, public_cpd)
