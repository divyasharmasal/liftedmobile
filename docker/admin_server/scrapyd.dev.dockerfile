FROM alpine:3.7

RUN apk update 
RUN apk --no-cache upgrade 
RUN apk add --no-cache python3 python3-dev openssl-dev ca-certificates        \
                       libffi-dev build-base py3-lxml supervisor py3-cffi     \
                       py3-requests curl
RUN pip3 --no-cache-dir install scrapyd scrapyd-client pytz schedule

RUN mkdir /etc/supervisor.d /var/log/scrapyd
RUN mkdir /var/log/scraper_scheduler

COPY ./docker/admin_server/scrapyd.conf /etc/scrapyd/
COPY ./docker/admin_server/supervisor_scrapyd.ini /etc/supervisor.d/

ENV PYTHONUNBUFFERED 1 

WORKDIR /scraper/scraper

CMD supervisord -c /etc/supervisord.conf                                   && \
    while sleep 3600; do :; done
