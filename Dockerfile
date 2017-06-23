FROM nginx:alpine

# Copy source code. Do not copy venv to minimise build size
RUN mkdir /src
COPY src/lm /src/lm
COPY src/requirements.txt /src/requirements.txt

WORKDIR /src

RUN apk update && \
    apk --no-cache upgrade && \
    apk --no-cache add python3 python3-dev \
        build-base libffi-dev && \
    pip3 install --upgrade pip && \
    pip3 install -r requirements.txt && \
    apk del build-base python3-dev && \
    rm -rf /var/cache/apk/*

RUN pip install gunicorn


#RUN mkdir /etc/nginx/sites-available/
#RUN mkdir /etc/nginx/sites-enabled/
#COPY config/nginx.conf /etc/nginx/sites_enabled/lm
#RUN ln -s /etc/nginx/sites-available/lm /etc/nginx/sites-enabled/

RUN mkdir /config
COPY config/nginx.conf /config/nginx.conf

EXPOSE 80
EXPOSE 8000

WORKDIR /src/lm
CMD gunicorn -D --bind unix:/gunicorn.sock \
    lm.wsgi:application && nginx -c /config/nginx.conf -g 'daemon off;'
