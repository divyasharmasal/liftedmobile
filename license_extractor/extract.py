#!/usr/bin/env python3
import subprocess
import json
import pprint
import re
import csv

def parse_yolk_output(yolk_output):
    parsed = []
    chunks = yolk_output.split("\n\n")
    for chunk in chunks:
        name_licence = [x.strip() for x in chunk.split("\n")]
        if len(name_licence) != 2:
            continue

        name_ver = name_licence[0].split("(")
        name = name_ver[0].strip()
        version = name_ver[1][0:-1]

        license = name_licence[1].split("License: ")[1]
        
        pypi_show_url_output = subprocess.run(["pypi-show-urls", "-p",
            name], stdout=subprocess.PIPE).stdout.decode("utf-8")
        url = re.compile("Candiates from (.+)\n",
                re.MULTILINE).search(pypi_show_url_output).groups(1)[0]\
                        .replace("/simple/", "/pypi/")

        if name == "django-htmlmin":
            license = 'BSD 2-clause "Simplified" License'
        elif name == "lxml":
            license = "BSD (with exceptions: "
            "https://github.com/lxml/lxml/blob/master/LICENSES.txt)"
        elif name == "pkg_resources":
            continue
        elif name == "setuptools":
            license = "MIT"



        parsed.append({
            "name": name,
            "version": version,
            "licenses": license,
            "url": url,
        })
    return parsed


def process_node_licenses(node_licenses):
    result = []
    for name_ver, data in node_licenses.items():
        if "licenseFile" not in data.keys():
            continue

        if name_ver.startswith("@"):
            name_ver = name_ver[1:]
        name_ver_s = name_ver.split("@")

        name = name_ver_s[0]
        version = name_ver_s[1]
        url = None
        licenses = data["licenses"]
        if isinstance(licenses, list):
            licenses = ", ".join(licenses)

        if name == "bcrypt-pbkdf":
            url = "https://www.npmjs.com/package/bcrypt-pbkdf"
        elif name == "webpack-plugin-replace":
            url = "https://www.npmjs.com/package/webpack-plugin-replace"
        elif name == "indexOf":
            url = "https://github.com/component/indexof/"
        elif "repository" in data.keys():
            url = data["repository"]

        result.append({
            "name": name,
            "version": version,
            "licenses": data["licenses"],
            "url": url,
        })
    return result
        

def parse_additional_licenses():
    result = []
    with open("additional_licenses.csv") as f:
        reader = csv.reader(f)
        for row in reader:
            result.append({
                "name": row[0],
                "version": row[1],
                "licenses": row[2],
                "url": row[3],
            })

    return result



if __name__ == "__main__":
    node_licenses = process_node_licenses(json.loads(
            subprocess.run(["license-checker", "--json"], 
                cwd="../src/frontend/", stdout=subprocess.PIPE)\
                        .stdout.decode("utf-8")))

    python_licenses = []
    python_licenses = parse_yolk_output(subprocess.run(["../src/venv/bin/yolk", "-l",
        "-f", "license"], stdout=subprocess.PIPE).stdout.decode("utf-8"))
    

    additional_licenses = parse_additional_licenses()

    licenses = sorted(node_licenses + python_licenses +
            additional_licenses, key=lambda x: x["name"].lower())

    with open("licenses.json", "w") as f:
        f.write(json.dumps(licenses))
