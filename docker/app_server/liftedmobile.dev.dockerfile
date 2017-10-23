FROM alpine:latest

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
    sh /src/lm/sleep_until_dev_pg_isready.sh && \
    python3 manage.py collectstatic --no-input && \
   #python3 manage.py makemigrations && \
   #python3 manage.py makemigrations --empty app && \
    python3 manage.py migrate && \
    echo && \
    echo "Docker containers are up; server at: http://0.0.0.0:8000/" && \
    echo "Run ./gulp-app.sh or ./gulp-cms.sh in a separate terminal to continually update the static files while you develop the frontend or CMS." && \
    echo && \
    python3 manage.py runserver 0.0.0.0:8000
