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

WORKDIR /src/lm
EXPOSE 8000
CMD ["python3", "manage.py", "runserver", "0.0.0.0:8000"]
