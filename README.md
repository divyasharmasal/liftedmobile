# LIFTED Mobile

A learning needs diagnostic tool for legal professionals, developed by the
Singapore Academy of Law.

## Development

### Installing Python requirements

To get started with developing the LIFTED Mobile source code, set up your
development environment by creating the Python 3 virtual environment and
installing requirements. The following only has to be run the first time you
work on the backend components written in Python 3.

```
cd liftedmobile/src
python3 -m venv venv && \
    source venv/bin/activate && \
    pip3 install --upgrade pip && \
    pip3 install -r requirements.txt
```

For subsequent times, simply run:

```
cd liftedmobile/src
source venv/bin/activate 
```

... and you're good to go.

### Updating Python requirements

If you use `pip3 install` to add any Python packages to the virtual
environment, make sure to update `requirements.txt` as well:

```
pip3 freeze > requirements.txt
```

Run `pip3 install -r requirements.txt` to install all the packages listed in `requirements.txt`.
