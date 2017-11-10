# -*- coding: utf-8 -*-

# Define here the models for your scraped items
#
# See documentation in:
# http://doc.scrapy.org/en/latest/topics/items.html

# import scrapy
from scrapy.item import Item, Field


class CourseItem(Item):
    name = Field()
    url = Field()
    start_date = Field()
    end_date = Field()
    upcoming = Field()
