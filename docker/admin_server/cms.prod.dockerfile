FROM nginx:alpine

RUN mkdir /src

# Copy source code. Note that src/venv should be in .dockerignore
COPY src /src

# Copy the nginx config file
RUN mkdir /config
COPY ./docker/admin_server/nginx.conf /nginx.conf

WORKDIR /src

# RUN these to install yarn without apk:
    #touch ~/.profile                                                        && \ 
    #curl -o- -L https://yarnpkg.com/install.sh | sh                         && \
    #ln -s /root/.yarn/bin/yarn /bin/yarn                                    && \
    #ln -s /root/.yarn/bin/yarnpkg /bin/yarnpkg                              && \
    #ln -s /root/.yarn/bin/yarn.js /bin/yarn.js                              && \

RUN apk update                                                              && \
    apk --no-cache upgrade                                                  && \
    apk --no-cache add python3 python3-dev postgresql py-psycopg2              \
        curl gnupg nodejs linux-headers build-base                             \
        libffi-dev bash py3-lxml                                            && \ 
    pip3 --no-cache-dir install --upgrade pip                               && \
    pip3 --no-cache-dir install -r /src/requirements.txt                    && \
    apk --no-cache add yarn --repository                                       \
        http://dl-3.alpinelinux.org/alpine/edge/community                   && \
    yarn global add preact-cli gulp gulp-shell                              && \
    cd /src/lm/cms/frontend                                                 && \
    yarn install                                                            && \
    yarn add gulp                                                           && \
    echo "Running gulp deploy on frontend"                                  && \
    gulp deploy --gulpfile /src/lm/cms/frontend/gulpfile.js                 && \
    yarn cache clean                                                        && \
    apk del build-base python3-dev linux-headers nodejs gnupg libffi-dev       \
            binutils-gold gcc g++ curl make yarn                            && \
    rm -rf /src/frontend/node_modules /usr/local/share/.config/yarn            \
           /root/.config/yarn/global/node_modules                              \
           /usr/lib/node_modules /var/cache/apk/* /usr/share/man /tmp/*        \
           /root/.node-gyp /root/.gnupg /root/.npm                             \
           /src/lm/app/frontend/ /src/lm/cms/frontend/                         \
           /src/lm/static/app/fonts/                                           \
           /src/lm/static/app/dist/ssr-build/ /bin/yarn /bin/yarnpkg           \
           /bin/yarn.js /root/.yarn

EXPOSE 80

WORKDIR /src/lm

CMD sh /src/lm/wait_for_db.sh admin_db                                      && \
    python3 manage.py migrate                                               && \
    python3 manage.py collectstatic --no-input                              && \
    gunicorn -D --bind unix:/gunicorn.sock lm.wsgi:application              && \
    echo                                                                    && \
    echo "Docker containers are up; server at: http://0.0.0.0:80/"          && \
    nginx -c /nginx.conf -g 'daemon off;'
