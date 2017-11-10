FROM postgres:alpine
ADD ./db.init.sql /docker-entrypoint-initdb.d/
