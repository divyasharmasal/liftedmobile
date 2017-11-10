FROM alpine:latest
RUN apk update                                                             && \
    apk --no-cache upgrade                                                 && \
    apk add --no-cache python3 python3-dev openssl-dev ca-certificates        \
                       libffi-dev build-base py3-lxml supervisor              \
                       py3-requests                                        && \
    pip3 --no-cache-dir install scrapyd scrapyd-client pytz                && \
    apk del build-base                                                     && \
    rm -rf /var/cache/apk

RUN mkdir /etc/supervisor.d /var/log/scrapyd
COPY ./docker/admin_server/supervisor_scrapyd.ini /etc/supervisor.d/
COPY ./docker/admin_server/scrapyd.conf /etc/scrapyd/
COPY ./admin_server/scraper/ /scraper

CMD supervisord -c /etc/supervisord.conf && \
    python3 /scraper/wait_for_scrapyd.py http://0.0.0.0:6800 && \
    cd /scraper && \
    scrapyd-deploy && \
    while sleep 3600; do :; done
