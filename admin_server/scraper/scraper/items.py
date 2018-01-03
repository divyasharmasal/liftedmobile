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
    cost = Field()
    date_ranges = Field()
    public_cpd = Field()
    upcoming = Field()
    provider = Field()
    level = Field()
