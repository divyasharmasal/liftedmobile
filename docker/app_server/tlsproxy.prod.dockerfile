FROM nginx:alpine

RUN apk update                                                              && \
    apk --no-cache upgrade                                                  && \
    apk --no-cache add python3 build-base python3-dev libffi-dev               \
                       linux-headers openssl-dev                            && \
    pip3 --no-cache-dir install --upgrade pip                               && \
    pip3 install certbot-nginx certbot                                      && \
    apk del python3-dev libffi-dev linux-headers openssl-dev build-base     && \
    rm -rf /var/cache/apk/* /usr/share/man /tmp/* 

COPY ./docker/app_server/nginx.conf.tlsproxy /etc/nginx/nginx.conf
COPY ./docker/app_server/configure_tls.py /configure_tls.py

RUN mkdir /certbot_webroot
ENV PYTHONUNBUFFERED 1

CMD nginx -c /etc/nginx/nginx.conf                                          && \
    python3 /configure_tls.py                                               && \
    while sleep 3600; do :; done
