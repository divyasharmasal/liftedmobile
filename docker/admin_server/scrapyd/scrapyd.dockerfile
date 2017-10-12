FROM alpine:latest


RUN apk update 
RUN apk --no-cache upgrade 

RUN apk add --no-cache python3 python3-dev openssl-dev ca-certificates \
                       libffi-dev build-base py3-lxml
RUN pip3 --no-cache-dir install scrapyd

ADD ./scrapyd.conf /etc/scrapyd/

# TODO: set up volumes for eggs, logs, items, etc

EXPOSE 80
EXPOSE 443
EXPOSE 6800

CMD ["scrapyd"]
