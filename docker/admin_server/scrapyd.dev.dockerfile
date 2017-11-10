FROM alpine:3.6

RUN apk update 
RUN apk --no-cache upgrade 
RUN apk add --no-cache python3 python3-dev openssl-dev ca-certificates        \
                       libffi-dev build-base py3-lxml  supervisor py3-cffi    \
                       py3-requests curl
RUN pip3 --no-cache-dir install scrapyd scrapyd-client pytz

RUN mkdir /etc/supervisor.d /var/log/scrapyd
COPY ./docker/admin_server/scrapyd.conf /etc/scrapyd/
COPY ./docker/admin_server/supervisor_scrapyd.ini /etc/supervisor.d/
COPY ./admin_server/scraper/ /scraper

CMD supervisord -c /etc/supervisord.conf                                   && \
    python3 /scraper/wait_for_scrapyd.py http://0.0.0.0:6800               && \
    cd /scraper                                                            && \
    scrapyd-deploy                                                         && \
    while sleep 3600; do :; done
