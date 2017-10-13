FROM nginx:alpine
RUN mkdir /src

COPY admin/cms /src/
COPY admin/requirements.txt /src/requirements.txt

# Copy the nginx config file
RUN mkdir /config
COPY ./docker/admin_server/nginx.conf /nginx.conf

WORKDIR /src

RUN apk update && apk --no-cache upgrade 

RUN apk --no-cache add python3 python3-dev py-psycopg2 postgresql
RUN pip3 --no-cache-dir install --upgrade pip
RUN pip3 --no-cache-dir install -r /src/requirements.txt

WORKDIR /src

CMD sh /src/cms/sleep_until_pg_isready.sh                                   && \
    python3 manage.py migrate                                               && \
    python3 manage.py collectstatic --no-input                              && \
    gunicorn -D --bind unix:/gunicorn.sock cms.wsgi:application             && \
    echo                                                                    && \
    echo "Docker containers are up; server at: http://0.0.0.0:90/"          && \
    nginx -c /nginx.conf -g 'daemon off;'
