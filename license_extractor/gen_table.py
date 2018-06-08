#!/usr/bin/env python3
import json

if __name__ == "__main__":
    data = json.loads(open("./licenses.json").read())
    print("<table class=\"pure-table\">")
    print("<thead>")
    print("<tr>")
    print("<th>Name</th>")
    print("<th>Version</th>")
    print("<th>Licenses</th>")
    print("<th>URL</th>")
    print("</tr>")
    print("</thead><tbody>")
    for row in data:
        name = row["name"]
        url = row["url"]
        licenses = row["licenses"]
        version = row["version"]
        print("<tr>")
        print("<td>%s</td>" % name)
        print("<td>%s</td>" % version)
        print("<td>%s</td>" % licenses)
        print("<td>%s</td>" % url)
        print("</tr>")

    print("</tbody></table>")
