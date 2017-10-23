FROM alpine:latest
COPY admin_server/requirements.txt /cms/requirements.txt

WORKDIR /cms

RUN apk update 

RUN apk --no-cache add python3 python3-dev py-psycopg2 postgresql build-base libffi-dev
RUN pip3 --no-cache-dir install --upgrade pip
RUN pip3 --no-cache-dir install -r /cms/requirements.txt

ENV PYTHONUNBUFFERED 1
ENV DEV 1

CMD sh /cms/sleep_until_pg_isready.sh admin_db_dev                          && \
    python3 manage.py collectstatic --no-input                              && \
    python3 manage.py migrate                                               && \
    echo && \
    echo "Docker containers are up; server at: http://0.0.0.0:9000/"        && \
    echo "Run ./gulp-app.sh or ./gulp-cms.sh in a separate terminal to continually update the static files while you develop the CMS." && \
    echo && \
    python3 manage.py runserver 0.0.0.0:9000
