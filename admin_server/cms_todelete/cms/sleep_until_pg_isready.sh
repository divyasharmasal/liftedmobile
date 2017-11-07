echo "Waiting for the database to be ready..."
while ! pg_isready -q -h admin_db -U postgres
do
    sleep 0.5
done
