# LIFTED Mobile

A learning needs diagnostic tool for legal professionals, developed for the
Singapore Academy of Law.

## Development

### Prerequsites

You need the following software to proceed:

- [`docker`](https://www.docker.com/community-edition): 17.03.1-ce or above
- [`docker-compose`](https://docs.docker.com/compose/install/): 1.13.0 or above
- [`git`](https://git-scm.com/)

### Getting the source code

All the source code for LIFTED Mobile can be cloned via `git`. There are two
repositories, which should be kept identical for the sake of redundancy:

`ssh://git-codecommit.eu-west-1.amazonaws.com/v1/repos/liftedmobile`

and

`git@github.com:weijiekoh/liftedmobile.git`

#### The AWS Repository

This is hosted via AWS CodeCommit. The only user currently in control of the
repository is `liftedmobile`.

#### The GitHub Repository

The same SSH key as the one linked to AWS CodeCommit can be used to read and
write to this repository.

Protip: `~/.ssh/config` can be configured such that you can use a specific SSH
key for a particular repository.


In `~/.ssh/config`:
```
Host github_lm
HostName github.com
IdentityFile ~/.ssh/liftedmobile_codecommit_rsa
```

Now, run the following to add the GitHub remote. Note that instead of `github.com`, I specify `github_lm` as defined in `~/.ssh/config`.

```
git remote add github git remote add github git@github_lm:weijiekoh/liftedmobile.git
```


## Local development

Just `cd` to the `liftedmobile` directory and run:

```
./build_dev.sh
```

This spins up the following containers:
- `liftedmobile_dev`: an Nginx server serving content from `gunicorn` and
  Django on port `8000`
- `liftedmobile_db_dev`: a Postgres server

Any changes you make to the `src/` directory will immediately show up in the
container.


To view the logs from the container, run:

```
docker logs -f liftedmobile_dev
```

Launch Lifted Mobile: http://localhost:8000

## Deployment

### Building the Docker image

Run:

```
./build_prod.sh
```

This spins up the following containers (which do not use volumes):
- `liftedmobile`: an Nginx server serving content from `gunicorn` and Django.
- `liftedmobile_db`: a Postgres server

To view the logs from the `liftedmobile` container, run:

```
docker logs -f liftedmobile
```

Launch Lifted Mobile: http://localhost:80

## Database

You can run `psql` on `liftedmobile_db` or `liftedmobile_db_dev` as such:

```
docker exec -it liftedmobile_db psql -U postgres
```

```
docker exec -it liftedmobile_db_dev psql -U postgres
```

### Migrations

Initial data is loaded into the database via migrations. Specifically, 
`0002_auto_20170629_0827.py` in the `migrations/` directory uses `RunPython`
to populate the database with data from the MVP.

To make a change to this data, it's easier to wipe the database and edit the
migration, instead of creating a new migration:

```
docker kill liftedmobile_db_dev && \
docker rm liftedmobile_db_dev && \
docker rmi docker_db_dev
```
