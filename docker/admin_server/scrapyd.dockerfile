FROM alpine:latest


RUN apk update 
RUN apk --no-cache upgrade 

RUN apk add --no-cache python3 python3-dev openssl-dev ca-certificates \
                       libffi-dev build-base py3-lxml
RUN pip3 --no-cache-dir install scrapyd

EXPOSE 80
EXPOSE 443

CMD scrapyd
