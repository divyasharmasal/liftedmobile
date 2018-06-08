# -*- coding: utf-8 -*-
import scrapy
import json
import pytz
import datetime
from datetime import timedelta

from ..items import CourseItem

URL_STR = (
    "https://www.myskillsfuture.sg/services/"
    "tex/individual/course-search?query="
    "start={start_num}%26rows%3D24%26fq%3DArea_of_Training%253A(%25220"
    "28%2522)%26facet%3Dtrue%26facet.mincount%3D1%26json.nl%3Dmap%26fa"
    "cet.field%3D%257B!ex%253DCourse_Vacancy%257DCourse_Vacancy%26face"
    "t.field%3D%257B!ex%253DCourse_Vacancy%257DCourse_Vacancy_facet%26"
    "facet.field%3D%257B!ex%253DTP_ALIAS_Suggest%257DTP_ALIAS_Suggest%"
    "26facet.field%3D%257B!ex%253DWheelchair_Access%257DWheelchair_Acc"
    "ess%26facet.field%3D%257B!ex%253DArea_of_Training%257DArea_of_Tra"
    "ining%26facet.field%3D%257B!ex%253DArea_of_Training%257DArea_of_T"
    "raining_facet%26facet.field%3D%257B!ex%253DJob_Level%257DJob_Leve"
    "l%26facet.field%3D%257B!ex%253DJob_Level%257DJob_Level_facet%26fa"
    "cet.field%3D%257B!ex%253DMode_of_Training%257DMode_of_Training%26"
    "facet.field%3D%257B!ex%253DMode_of_Training%257DMode_of_Training_"
    "facet%26facet.field%3D%257B!ex%253DMedium_of_Instruction%257DMedi"
    "um_of_Instruction%26facet.field%3D%257B!ex%253DMedium_of_Instruct"
    "ion%257DMedium_of_Instruction_facet%26facet.field%3D%257B!ex%253D"
    "Minimum_Education_Req%257DMinimum_Education_Req%26facet.field%3D%"
    "257B!ex%253DMinimum_Education_Req%257DMinimum_Education_Req_facet"
    "%26fq%3DCourse_Supp_Period_To_1%253A%255B2017-12-27T00%253A00%253"
    "A00Z%2520TO%2520*%255D%26fq%3DIsDisplaySFC%253Atrue%26q%3D*%253A*"
    "%26sort%3DCourse_Title_facet%2520asc%252CCourse_SEO_Name%2520asc%"
    "26refresh%3D1514367831700")


def build_query_str(start_num):
    """
    The JSON result from the SF endpoint provides a max. of 24 results per
    response, starting from @start_num.
    """
    return URL_STR.format(start_num=start_num)


class SkillsfutureSpider(scrapy.Spider):
    name = 'skillsfuture'
    allowed_domains = ['www.myskillsfuture.sg']
    start_urls = [build_query_str(0)]


    def convert_date_str(self, date):
        tz = pytz.timezone("Asia/Singapore")
        d = datetime.datetime.strptime(date, "%Y-%m-%dT%H:%M:%SZ")
        return tz.localize(d, is_dst=None)


    def parse(self, response):
        data = json.loads(response.body)

        rows = int(data["responseHeader"]["params"]["rows"])
        total_results = int(data["grouped"]["GroupID"]["matches"])

        start_num = 0
        if "start_num" in response.meta:
            start_num = response.meta["start_num"]

        groups = data["grouped"]["GroupID"]["groups"]

        for group in groups:
            course_data = group["doclist"]["docs"][0]
            detail_url = ("https://www.myskillsfuture.sg/services/tex/"
                          "individual/course-detail?action="
                          "get-course-by-ref-number&refNumber={ref_num}")
            request = scrapy.Request(
                detail_url.format(ref_num=course_data["Course_Ref_No"]),
                callback=self.parse_indiv_course)
            request.meta["course_data"] = course_data
            yield request

        if start_num >= total_results:
            yield None
        elif len(groups) == 0:
            yield None
        else:
            next_start_num = start_num + rows
            request = scrapy.Request(
                build_query_str(next_start_num), callback=self.parse)

            request.meta["start_num"] = next_start_num
            yield request


    def parse_indiv_course(self, response):
        indiv_course_data = json.loads(response.body)["data"]
        course_data = response.meta["course_data"]

        name = None
        if "Course_Title" in course_data:
            name = course_data["Course_Title"].strip()
            if name.isupper():
                name = name.title()

        provider = None
        if "Organisation_Name" in course_data:
            provider = course_data["Organisation_Name"].strip()
            if provider.isupper():
                provider = provider.title()

        cost = None
        if "totalCostOfTrainingPerTrainee" in indiv_course_data:
            cost = float(indiv_course_data["totalCostOfTrainingPerTrainee"])

        url_prefix = ("https://www.myskillsfuture.sg/content/portal/en/"
               "training-exchange/course-directory/course-detail.html"
               "?courseReferenceNumber={course_ref_num}")

        course_ref_num = indiv_course_data["courseReferenceNumber"]

        url = url_prefix.format(course_ref_num=course_ref_num)

        date_ranges = []
        if "Course_Start_Date" in course_data:
            duration = 0
            if "Len_of_Course_Duration" in course_data:
                duration = course_data["Len_of_Course_Duration"] - 1

            for start_date in course_data["Course_Start_Date"]:
                parsed_start_date = self.convert_date_str(start_date)

                end_date = None
                if duration > 0:
                    end_date = parsed_start_date + timedelta(days=duration)
                    end_date = end_date.isoformat()

                date_ranges.append({
                    "start": parsed_start_date.isoformat(),
                    "end": end_date
                })

        yield CourseItem(
            name=name,
            url=url,
            cost=cost,
            date_ranges=date_ranges,
            provider=provider,
            upcoming=None,
            public_cpd=None,
            level=None,
        )
