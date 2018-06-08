FROM alpine:3.7

RUN apk update
RUN apk --no-cache add vault                                                  \
        --repository https://dl-3.alpinelinux.org/alpine/edge/testing      && \
        apk --no-cache add libcap

COPY ./scripts/admin_server/dev/vault /vault

CMD sh /vault/run_vault.sh
