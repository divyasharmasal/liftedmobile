FROM postgres:alpine
ADD ./docker/app_server/db_dev.init.sql /docker-entrypoint-initdb.d/
