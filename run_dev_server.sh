#!/bin/bash

DEV=true 
DB_PWD=fGWJTw2Dbpa2p547brXEVjXyzHZu9puytcAaA9mY 

# Start the development DB
docker rm liftedmobile_dev_db
docker build -f ./dockerfiles/dev_db -t liftedmobile_dev_db dockerfiles/
docker run -e POSTGRES_PASSWORD=${DB_PWD} \
    -t -d -i --name liftedmobile_dev_db \
    -p 5433:5432 liftedmobile_dev_db

echo "Waiting for the database to start..."
while ! pg_isready -h localhost -p 5433 | grep accepting
do
    sleep 0.5
done

cd src
source venv/bin/activate

# Install Python requirements
pip3 install -r ../requirements.txt

# Run the server
cd lm
DEV=${DEV} DB_PWD=${DB_PWD} python3 manage.py migrate
DEV=${DEV} DB_PWD=${DB_PWD} python3 manage.py collectstatic --no-input
DEV=${DEV} DB_PWD=${DB_PWD} python3 manage.py runserver 0.0.0.0:8000 && 
docker stop liftedmobile_dev_db &&
deactivate
