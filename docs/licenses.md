# Source Code Licenses

The Lifted App relies on many open-source software (OSS) libraries, which in
turm rely on other OSS libraries, and so on. To compile a list of all libraries
in this dependency graph, use the tools in `license_extractor/`.

First, you'll need to [install `yarn`](https://yarnpkg.com).

Next, run these commands in a terminal:

```bash
sudo yarn global add license-checker
cd license_extractor
virtualenv -p python3 venv
source venv/bin/activate
pip3 install -r requirements.txt
python3 extract.py
./gen_table.py > ../src/lm/app/templates/app/license_table.html
```

Build the app, and visit `<app URL>/terms/`. You will see a long list of
dependency names, along with their version numbers, licenses, and URLs. At the
time of writing, there are 1180 entries.

## What these tools do

`extract.py` gathers all JavaScript and Python license data from the frontend
code. It uses the output of the
[`license-checker`](https://www.npmjs.com/package/license-checker) tool to
gather information about the frontend's JavaScript dependencies, and the output
of the [`yolk`](https://pypi.python.org/pypi/yolk3k/) tool to do the same for
Python dependencies. It saves the data to `licenses.json`.
Subquently,`gen_table.py` reads this file and prints a HTML table to the
standard output. The last command shown above directs this to the
`license_table.html` template in the App, which then gets rendered by the
`terms_of_use()` view.
