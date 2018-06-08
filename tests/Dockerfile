FROM alpine:3.4

RUN echo "http://dl-4.alpinelinux.org/alpine/v3.4/main" >> /etc/apk/repositories && \
    echo "http://dl-4.alpinelinux.org/alpine/v3.4/community" >> /etc/apk/repositories

#RUN apk update                                                              && \
    #apk add python py-pip curl unzip libexif udev chromium \
        #chromium-chromedriver xvfb                                          && \
    #pip install selenium                                                    && \
    #pip install pyvirtualdisplay

RUN apk update                                                              && \
    apk add python3 python3-dev curl unzip libexif udev chromium \
        chromium-chromedriver xvfb                                          && \
    pip3 install --upgrade pip                                              && \
    pip3 install selenium                                                   && \
    pip3 install pyvirtualdisplay

ENV PYTHONUNBUFFERED 1

COPY ./test.py /test.py
EXPOSE 8000

CMD ["python3", "/test.py"]
