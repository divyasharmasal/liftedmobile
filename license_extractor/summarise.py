#!/usr/bin/env python3
import json

if __name__ == "__main__":
    licenses = set()
    data = json.loads(open("./licenses.json").read())
    for row in data:
        l = row["licenses"]
        licenses.add(l)
    
    for license in licenses:
        print(license)
