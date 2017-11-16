FROM alpine:3.5

WORKDIR /src

COPY ./src/requirements.txt /requirements.txt

# Install dependencies to get Django running
RUN apk update
RUN apk add python3 python3-dev py-psycopg2 postgresql-dev \
            postgresql linux-headers build-base libffi-dev \
            libxslt-dev libxml2-dev && \
    rm -rf /var/cache/apk/* && \
    pip3 --no-cache-dir install --upgrade pip && \
    pip3 --no-cache-dir install -r /requirements.txt

EXPOSE 8000

ENV PYTHONUNBUFFERED 1
ENV DEV 1

# Wait till the database is ready and then launch the dev server
CMD cd /src/lm && \
    sh /src/lm/wait_for_db.sh liftedmobile_db_dev && \
    python3 manage.py collectstatic --no-input && \
    python3 manage.py migrate && \
    echo && \
    echo "Docker containers are up; server at: http://0.0.0.0:8000/" && \
    echo "Run ./scripts/app_server/dev/gulp-app.sh in a separate terminal to continually update the static files while you develop the frontend." && \
    echo "Also run ./scripts/app_server/dev/watch-app.sh in a separate terminal for preact-cli to build the frontend as you code." && \
    echo && \
    python3 manage.py runserver 0.0.0.0:8000
