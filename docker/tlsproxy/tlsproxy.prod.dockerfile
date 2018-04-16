FROM nginx:alpine

RUN apk update                                                              && \
    apk --no-cache upgrade                                                  && \
    apk --no-cache add python3 build-base python3-dev libffi-dev               \
                       linux-headers openssl-dev                            && \
    pip3 --no-cache-dir install --upgrade pip                               && \
    pip3 install certbot-nginx certbot certbot-dns-route53                  && \
    apk del python3-dev libffi-dev linux-headers openssl-dev build-base     && \
    rm -rf /var/cache/apk/* /usr/share/man /tmp/* 

COPY ./docker/tlsproxy/nginx.conf /etc/nginx/nginx.conf
COPY ./docker/tlsproxy/configure_tls.py /configure_tls.py
COPY ./docker/tlsproxy/edit_nginx_conf.py /edit_nginx_conf.py

RUN mkdir /certbot_webroot
ENV PYTHONUNBUFFERED 1

CMD python3 /edit_nginx_conf.py                                             && \
    nginx -c /etc/nginx/nginx.conf                                          && \
    python3 /configure_tls.py                                               && \
    while sleep 3600; do :; done
