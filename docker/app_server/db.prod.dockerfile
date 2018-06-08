FROM postgres:alpine
ADD ./docker/app_server/db.init.sql /docker-entrypoint-initdb.d/
