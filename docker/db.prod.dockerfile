FROM postgres:alpine
ADD ./docker/db.init.sql /docker-entrypoint-initdb.d/
