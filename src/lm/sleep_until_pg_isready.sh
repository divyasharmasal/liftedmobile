while ! pg_isready -h liftedmobile_db_dev -U postgres
do
    sleep 0.5
done
