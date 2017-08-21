# -*- coding: utf-8 -*-
"""
Extract data from the ODS spreadsheets which contain
the LIFTED framework and courses for 2017.
(see https://liftedsg.files.wordpress.com/2017/01/lifted-learning-planner-2017-with-insert.pdf)
"""

#!/usr/bin/env python3
import pyexcel_odsr
import os


def _make_path(filename):
    """
    Returns an absolute path of @filename, assuming that it's in the same
    directory as this Python file.
    """
    return os.path.join(os.path.dirname(os.path.abspath(__file__)), filename)


LEVELS_FILE = _make_path("levels.ods")
VENUES_FILE = _make_path("venues.ods")
FORMATS_FILE = _make_path("formats.ods")
NEEDS_FILE = _make_path("needs.ods")
COURSES_FILE = _make_path("courses.ods")
VERTICALS_FILE = _make_path("verticals.ods")
COMPETENCIES_FILE = _make_path("competencies.ods")
JOB_ROLES_FILE = _make_path("job_roles.ods")


def parse_item_rows(ods_data):
    """
    Where each row contains a distinct item, and the headers
    represent keys.

    [ { header1: value1, header2: value2, ...}
        { header1: value1, header2: value2, ...} ]
    """
    sheet = ods_data[list(ods_data.keys())[0]]
    headers = sheet[0]
    result = []

    for row in sheet[1:]:
        if len(row) == 0:
            break

        data = {}
        i = 0
        for cell in row:
            data[headers[i]] = cell
            i += 1
        result.append(data)

    return result


def read_ods_file(filename):
    """
    Wraps pyexcel_odsr.get_data()
    """
    data = pyexcel_odsr.get_data(filename)
    return data


def parse_levels():
    return parse_item_rows(read_ods_file(LEVELS_FILE))


def parse_venues():
    return parse_item_rows(read_ods_file(VENUES_FILE))


def parse_formats():
    return parse_item_rows(read_ods_file(FORMATS_FILE))


def parse_needs():
    rows = parse_item_rows(read_ods_file(NEEDS_FILE))
    for row in rows:
        formats = [x.strip() for x in row["Formats"].split("/")]
        row["Formats"] = formats

        levels = [x.strip() for x in row["Levels"].split("/")]
        row["Levels"] = levels

    return rows


def parse_courses():
    rows = parse_item_rows(read_ods_file(COURSES_FILE))
    for row in rows:
        start_dates = []
        for date in row["Start dates (2017)"].split("\n"):
            d = date.strip()
            if len(d) > 0:
                start_dates.append(date.strip())
        row["Start dates (2017)"] = start_dates

        funding_types = []
        for funding_type in row["Available Funding"].split("/"):
            f = funding_type.strip()

            if len(f) > 0:
                funding_types.append(funding_type.strip())
        row["Available Funding"] = funding_types

        competencies = []
        comps = str(row["Competencies"]).split(",")
        for comp in comps:
            c = comp.strip()
            competencies.append(int(c))
        row["Competencies"] = competencies

    return rows


def parse_funding_types():
    """
    Extract funding type IDs from the course spreadsheet:
    ['–', 'C$', 'SFA', 'WSQ', 'SF']
    """
    ods_data = read_ods_file(COURSES_FILE)["Courses"]
    headers = ods_data[0]

    i = 0
    for header in headers:
        if header == "Available Funding":
            funding_index = i
            break
        i += 1

    all_funding_types = set()
    for row in ods_data[1:]:
        # stop the loop when the row is empty
        if len(row) == 0:
            break
        funding_types = [x.strip() for x in row[funding_index].split("/")]
        for f_type in funding_types:
            if len(f_type) > 0:
                all_funding_types.add(f_type)
    return list(all_funding_types)



def parse_verticals():
    """
    The verticals.ods spreadsheet is a tree, not a list.
    Each of the 3 verticals has 7-8 categories.
    """

    ods_data = read_ods_file(VERTICALS_FILE)["Verticals"]
    headers = ods_data[0]

    i = 0
    result = []
    current_vertical = {"categories": []}
    for row in ods_data[1:]:
        # stop the loop when the row is empty
        if len(row) == 0:
            break

        # first row of each section
        if len(row) == 5:
            j = 0
            # handle the vertical and vertical_question
            for cell in row[0:2]:
                current_vertical[headers[j]] = cell
                j += 1

            category_data = {}
            for cell in row[2:]:
                category_data[headers[j]] = cell
                j += 1

            current_vertical["categories"].append(category_data.copy())
            category_data = {}
            result.append(current_vertical.copy())

            current_vertical = {"categories": []}
        # subsequent rows
        elif len(row) == 3:
            j = 2
            category_data = {}
            for cell in row:
                category_data[headers[j]] = cell
                j += 1
            result[-1]["categories"].append(category_data)
        i += 1

    return result


def trim_values(dict_data):
    """
    Strip trailing whitespace from each value in a dict
    """
    i = 0
    for data_item in dict_data:
        for key, value in data_item.items():
            if isinstance(value, str):
                dict_data[i][key] = value.strip()
        i += 1
    return dict_data


def parse_competencies():
    """
    Extract data about the competencies.
    """
    data = trim_values(parse_item_rows(read_ods_file(COMPETENCIES_FILE)))

    # Make empty specialisms None
    for row in data:
        if row["Specialism"] == "":
            row["Specialism"] = None
    return data


def parse_competency_categories():
    """
    Extract data about the competency categories.
    """
    competencies = parse_competencies()

    competency_categories = {}
    for competency in competencies:
        cat = competency["Competency Category"]
        if competency["Vertical"] not in competency_categories:
            competency_categories[competency["Vertical"]] = [cat]
        else:
            if cat not in competency_categories[competency["Vertical"]]:
                competency_categories[competency["Vertical"]].append(cat)
    return competency_categories


def parse_job_roles():
    """
    Extract data about job roles
    """
    data = trim_values(parse_item_rows(read_ods_file(JOB_ROLES_FILE)))

    # parse competency IDs
    for row in data:
        row["Competency IDs"] = [int(x.strip()) for x in row["Competency IDs "].split(",")]
        del row["Competency IDs "]
    return data


if __name__ == "__main__":
    import pprint
    pprint.pprint(parse_courses())
