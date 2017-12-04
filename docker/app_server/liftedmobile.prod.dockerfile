FROM nginx:alpine

RUN mkdir /src

# Copy source code. Note that src/venv should be in .dockerignore
COPY src /src

# Copy the nginx config file
RUN mkdir /config
COPY ./docker/app_server/nginx.conf /etc/nginx/nginx.conf

WORKDIR /src

    #wget -q http://geolite.maxmind.com/download/geoip/database/GeoLiteCountry/GeoIP.dat.gz \
        #-O /tmp/GeoIP.dat.gz                                                && \
    #gunzip /tmp/GeoIP.dat.gz && \
    #mv /tmp/GeoIP.dat /usr/share/GeoIP/                                     && \
    #wget -q http://geolite.maxmind.com/download/geoip/database/GeoLiteCity.dat.gz \
        #-O /tmp/GeoLiteCity.dat.gz                                          && \
    #gunzip /tmp/GeoLiteCity.dat.gz && \
    #mv /tmp/GeoLiteCity.dat /usr/share/GeoIP/                               && \

RUN apk update                                                              && \
    apk --no-cache upgrade                                                  && \
    apk --no-cache add python3 python3-dev postgresql py-psycopg2              \
        curl gnupg nodejs linux-headers build-base libxml2-dev libxslt-dev     \
        libffi-dev bash py3-lxml                                            && \ 
    pip3 --no-cache-dir install --upgrade pip                               && \
    pip3 --no-cache-dir install -r /src/requirements.txt                    && \
    apk --no-cache add yarn --repository                                       \
        http://dl-3.alpinelinux.org/alpine/edge/community                   && \
    yarn global add preact-cli gulp gulp-shell                              && \
    cd /src/lm/app/frontend                                                 && \
    yarn install                                                            && \
    yarn add gulp                                                           && \
    echo "Running gulp deploy on frontend"                                  && \
    gulp deploy --gulpfile /src/lm/app/frontend/gulpfile.js                 && \
    yarn cache clean                                                        && \
    apk del build-base python3-dev linux-headers nodejs gnupg libffi-dev       \
            binutils-gold gcc g++ curl make yarn libxml2-dev libxslt-dev    && \
    rm -rf /src/frontend/node_modules /usr/local/share/.config/yarn            \
           /root/.config/yarn/global/node_modules                              \
           /usr/lib/node_modules /var/cache/apk/* /usr/share/man /tmp/*        \
           /root/.node-gyp /root/.gnupg /root/.npm                             \
           /src/lm/app/frontend/ /src/frontend/src/fonts                       \ 
           /src/lm/static/app/fonts/ /src/lm/cms/frontend                      \
           /src/lm/static/app/dist/ssr-build/ /bin/yarn /bin/yarnpkg           \
           /bin/yarn.js /root/.yarn 

WORKDIR /src/lm
ENV PYTHONUNBUFFERED 1

CMD echo $(netstat -nr | grep '^0\.0\.0\.0' | awk '{print $2}') dockerhost     \
        >> /etc/hosts                                                       && \
    python3 /src/lm/wait_for_postgres.py                                    && \
    python3 manage.py migrate                                               && \
    python3 manage.py collectstatic --no-input                              && \
    gunicorn -D --bind unix:/gunicorn.sock lm.wsgi:application              && \
    echo                                                                    && \
    echo "Docker containers are up; server at: http://0.0.0.0:8001/"        && \
    nginx -c /etc/nginx/nginx.conf -g 'daemon off;'
