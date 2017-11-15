FROM alpine:latest

RUN apk update                                                             && \
    apk --no-cache upgrade                                                 && \
    apk add --no-cache python3 python3-dev openssl-dev ca-certificates        \
                       libffi-dev build-base py3-lxml  supervisor py3-cffi    \
                       py3-requests                                        && \
    pip3 --no-cache-dir install scrapyd scrapyd-client pytz schedule       && \
    apk del build-base                                                     && \
    rm -rf /var/cache/apk

RUN mkdir /etc/supervisor.d /var/log/scrapyd
RUN mkdir /var/log/scraper_scheduler

COPY ./docker/admin_server/scrapyd.conf /etc/scrapyd/
COPY ./docker/admin_server/supervisor_scrapyd.ini /etc/supervisor.d/
COPY ./admin_server/scraper/ /scraper

ENV PYTHONUNBUFFERED 1 

CMD supervisord -c /etc/supervisord.conf                                   && \
    while sleep 3600; do :; done
