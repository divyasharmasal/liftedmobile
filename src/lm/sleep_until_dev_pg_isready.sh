echo "Waiting for the database to be ready..."
while ! pg_isready -q -h liftedmobile_db_dev -U postgres
do
    sleep 0.5
done
