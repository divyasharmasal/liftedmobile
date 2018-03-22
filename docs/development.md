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

Next, run this command:

```bash
sudo yarn global add gulp gulp-shell preact-cli
```

## Set up your development workspace

Install App and CMS frontend dependencies and move static assets:

```bash
cd src/lm/app/frontend && \
yarn install && \
cd ../../cms/frontend && \
yarn install && \
gulp
```


To work on the code, set up three terminals.  You can use a
[`tmux`](https://tmux.github.io/) screen with 3 panes: one for your editor, one
for `watch-app.sh`, and one for the `build_dev.sh`.

```
-----------------------------
| vim        | watch-app.sh |
|            |              |
|            |--------------|
|            | build_dev.sh |
|            |              |
-----------------------------
```

There are two `watch-app.sh` files: one for the App, and another for the CMS.
- `scripts/app_server/dev/watch-app.sh`
- `scripts/admin_server/dev/watch-app.sh`

### Static assets
