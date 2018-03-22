# Development

The following instructions have only been tested on Ubuntu 17.10.

## Dependencies

### Install Docker and Docker Compose
First, install Docker CE. Follow the instructions here:
https://docs.docker.com/install/linux/docker-ce/ubuntu/

The following commands from the Docker CE installation page were copied on 22
March 2018:

```bash
sudo apt update && \
sudo apt -y install apt-transport-https ca-certificates curl software-properties-common && \
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add - && \
sudo apt-key fingerprint 0EBFCD88

# (now verify that the fingerprint is 9DC8 5822 9FC7 DD38 854A  E2D8 8D81 803C 0EBF CD88)

sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" && \
sudo apt update && sudo apt -y install docker-ce
```

The Docker version running in production on 22 March 2018 was `17.12.1-ce`. If
you encounter problems with newer versions, try using this version instead.

Make sure to add yourself to the `docker` group, so you can launch and manage
containers without root access:

```bash
sudo useradd -aG docker $USER
```

Next, install Docker Compose. Follow the instructions here:
https://docs.docker.com/compose/install/

### Install JS development dependencies

First, install Yarn. Follow the instructions here:
https://yarnpkg.com/lang/en/docs/install/

Next, run:

```bash
sudo yarn global add gulp gulp-shell preact-cli
```

## Set up your development workspace

Install App and CMS frontend dependencies and move static assets:

```bash
cd src/lm/app/frontend && \
yarn install && gulp build && \
cd ../../cms/frontend && \
yarn install && gulp build
```


To work on the code, set up three terminals.  You can use a
[`tmux`](https://tmux.github.io/) screen with 3 panes: one for your editor, one
for `watch-app.sh`, and one for the `build_dev.sh`.

```
-----------------------------
| vim        | watch-app.sh |
|            | (App)        |
|            |--------------|
|            | watch-app.sh |
|            | (CMS)        |
|            |--------------|
|            | build_dev.sh |
|            | (App or CMS) |
-----------------------------
```

Each `watch-app.sh` script runs `preact watch` with a pre-set working directory
path and port number. Each port number is hard-coded into App and CMS Django
templates, so these scripts make it easy to run `preact watch` without having
to remember the correct port.

There are two `watch-app.sh` scripts: one for the App, and another for the CMS.
- `scripts/app_server/dev/watch-app.sh`
- `scripts/admin_server/dev/watch-app.sh`

There are two `build_dev.sh` scripts: one for the App, and another for the CMS.
- `scripts/app_server/dev/build_dev.sh`
- `scripts/admin_server/dev/build_dev.sh`

### Static assets

Static assets should be saved in `src/lm/static/<app or cms>/images` and/or
`src/lm/static/<app or cms>/favicons`. Make sure that you run `gulp build`
in the `frontend/` directory of `app` or `cms` respectively once you do so:

```bash
cd src/lm/app/frontend && gulp build
```

or

```bash
cd src/lm/cms/frontend && gulp build
```

What `gulp build` does is replace the static files which the development server
uses with those in `src/lm/static/<app or cms>/`.
