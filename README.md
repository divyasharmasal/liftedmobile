# LIFTED Mobile

A learning needs diagnostic tool for legal professionals, developed for the
Singapore Academy of Law.

## Development

### Prerequsites

You need the following software to proceed:

- [`docker`](https://www.docker.com/community-edition): 17.03.1-ce or above
- [`docker-compose`](https://docs.docker.com/compose/install/): 1.13.0 or above
- [`git`](https://git-scm.com/)
- [`yarn`](https://yarnpkg.com/en/): 0.24.6 or above
- [`preact-cli`](https://github.com/developit/preact-cli): 1.3.0 or above
- [`gulp`](http://gulpjs.com/): 3.9.1 or above

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

### Backend 
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

### Frontend

The frontend is a single-page application written in Preact. 

`gulp` automates the process of running `preact build` while developing the
frontend code. Any changes to `src/frontend/gulpfile.js` or any files in the
frontend/src directory will trigger `preact build`, as defined in the build
task below.

If you wish to modify the frontend code, run this command in the `liftedmobile`
root directory to make `gulp` watch the `src/frontend/src` directory and
rebuild using `preact-build` when any change is made:

```
./gulp.sh
```

To run `preact build` once and **not** monitor for file changes:

```
./gulp.sh deploy
```

I personally use a [`tmux`](https://tmux.github.io/) screen with 3 panes: one
for my editor, one for `gulp.sh`, and one for the `build_dev.sh`.

```
-----------------------------
| vim        | gulp.sh      |
|            |              |
|            |--------------|
|            | build_dev.sh |
|            |              |
-----------------------------
```


## Deployment

### Secrets

The Docker images can access secret strings stored in
`docker/secrets/` via `/run/secrets/<secret name>` within the
container.

The production container uses the following secrets:
 - `docker/secrets/DJANGO_SECRET`: the Django secret key.
 - `./secrets/DJANGO_ADMIN_PWD`: the Django admin password
 - `./secrets/DJANGO_DEMO_PWD`: the demo account password
 - `./secrets/DJANGO_TEAM_PWD`: the team account password

### To build the Docker image

Run:

```
./build_prod.sh
```

This spins up the following containers:
- `liftedmobile`: an Nginx server serving content from `gunicorn` and Django.
- `liftedmobile_db`: a Postgres server

These containers do not use volumes.

To view the logs from the `liftedmobile` container, run:

```
docker logs -f liftedmobile
```

Launch Lifted Mobile: http://localhost:80

## Database

For an interactive Postgres terminal on `liftedmobile_db` or
`liftedmobile_db_dev`, run:

```
docker exec -it liftedmobile_db psql -U postgres
```

or 

```
docker exec -it liftedmobile_db_dev psql -U postgres
```

### Migrations

Initial data is loaded into the database via migrations. Specifically, 
`0002_auto....py` in the `migrations/` directory uses `RunPython`
to populate the database with data from the MVP.

To make a change to this data, it's easier to wipe the database and edit the
migration, instead of creating a new migration:

```
docker kill liftedmobile_db_dev && \
docker rm liftedmobile_db_dev && \
docker rmi docker_db_dev
```

## Deploying to AWS


Note your AWS login command, such as:

```
ssh -i "liftedmobile.pem" ubuntu@52.221.77.72
```

Locally, `cd` to the directory with `liftedmobile.pem`.

Run:

```
/path/to/push_prod.sh "ssh -i "liftedmobile.pem" ubuntu@52.221.77.72"
```

Now, `ssh` into the remote server.  Install `docker`, `docker-compose`, and
`git` on an AWS EC2 instance.

Clone the `liftedmobile` repository and `git checkout` to the `mvp` branch.

Run these commands to start the docker containers which you just pushed:

```
cd liftedmobile
docker-compose -f docker/docker-compose.prod.yml up -d
```
