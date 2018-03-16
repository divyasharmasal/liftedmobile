# Technical overview

The Lifted App and CMS, which we will refer to collectively as "the system",
are web apps which can be accessed through a modern web browser, both on
desktop or mobile devices. Like most web apps, the system is split into
frontend and backend code and subsystems.

## Backend architecture

Early in the development of the system, it was found that pre-packaged software
solutions which can meet LEC's needs do not exist. As such, the App and CMS
were tailor-made.

<a href="./images/architecture.png" target="_blank">
    <img src="./images/architecture.png" width=400 />
</a>
<!--![Local Image](./images/architecture.png)-->

The backend runs on two Amazon EC2 server instances and uses Amazon CloudFront
as a content delivery network (CDN). Amazon Route 53 manages the Domain Name
Service (DNS) records of the `lifted.sg` domain, registered under [Speednames
Asia](https://speednames.asia/). All application logs (except for those of the
scraper) are fed to Amazon CloudWatch.

<a href="./images/aws_services.png" target="_blank">
    <img src="./images/aws_services.png" width=200 />
</a>
<!--![Local Image](./images/aws_services.png)-->

The app and CMS servers run Docker (v17) containers orchestrated by Docker
Compose (v1.17.1), as well as one non-containerised Postgres (v9.5) instance
per server.

The EC2 instances use a security group as a firewall. It restricts access to
each databases to the IP addresses of each server, and opens the necessary
ports for database, HTTP and SSH access. In effect, each databases can only be
accessed from `localhost` or from the other server, and not externally. 
Furthermore, all non-whitelisted ports are blocked.

The system architecture is separated in this way to improve security and
reliability. As the CMS is meant for internal use only, and the App for public
use, keeping the CMS data separate prevents an entire class of bugs which might
expose it through potentially flawed App code. Moreover, having the CMS
separate allows it to be upgraded without affecting the App.

Docker was chosen because it greatly reduces deployment time and eliminates
many server environment inconsistencies. The goal was to make deployment as
hassle-free as possible due to the large number and complex relationships
between code dependencies in both the frontend and backend.

The backend web server runs Django because it is reliable, elegant, and
battle-tested. It provides very useful features, especially a powerful database
ORM, right out of the box.

The source code is managed via a single Git repository, and backed up in both
Github and AWS CodeCommit. The source code is organised in the following
manner. Deployment-related code is confined to the `docker` and `scripts`
directories, while source code for the system mainly resides in `src`. Note
that some directories, such as those for Django templates or migrations are
excluded below as it is only a general overview or the organisation of the
code.

```
admin_server
    |- scraper/
docker
    |- admin_server
        |- Docker, Docker Compose, and configuration files
    |- app_server
        |- Ditto
docs (this Gitbook)
license_extractor (see below)
scripts (deployment scripts)
    |- admin_server
        | dev
        | prod
    |- app_server
        | dev
        | prod
src
    |- lib (TODO: shift to a more suitable location
    |- lm (the Django project directory)
        |- app
            |- frontend
        |- cms
            |- frontend
        |- static
```

### The Docker containers

The Docker containers run Alpine Linux to reduce image size, minimise attack
surfaces, and simplify development. The small image size benefit can be most
acutely experienced when deploying the system, a process that involves using
`docker push` to copy Docker images to the remote servers. If the images were
to use Ubuntu or even Debian images, this process would take up more than twice
the amount of time and bandwidth.

On the CMS server, Docker Compose orchestrates the following containers via
`docker/admin_server/docker-compose.prod.yml`:

- **admin_cms**
    - Defined in `docker/admin_server/cms.prod.dockerfile`.
    - Runs Gunicorn and Nginx to serve the Django project located at `src/lm`.
      More information about this Django project can be found below.
    - Configuration files:
        - `docker/admin_server/nginx.conf`

- **admin_scrapyd**
    - Defined in `docker/admin_server/scrapyd.prod.dockerfile`.
    - Using `supervisord`, the container runs `scrapyd`, which is in turn
      configured to control a Scrapy project whose code is located in
      `admin_server/scraper/`.
    - `supervisord` is necessary in order to schedule scrape jobs and run the
      `scrapyd` daemon in the background. However, note that the scrape job
      scheduler at `scraper_scheduler.py` is disabled as the Lifted team prefers to
      launch the jobs manually.
    - Configuration files:
        - `docker/admin_server/scrapyd.conf`
        - `docker/admin_server/supervisor_scrapyd.ini`

- **admin_db**
    - Defined in `docker/admin_server/db.prod.dockerfile`.
    - Only useful when running the CMS on a machine that does not have a local
      copy of Postgres, such as a development machine. On a production machine,
      do not configure `admin_cms` to connect to this container, and use a
      non-Dockerised Postgres database instead. If you do this, `admin_db` can
      be left alone.
    - Configuration files:
        - `./docker/app_server/db.init.sql`: creates a database called
          `admin` and grants access privileges to the `postgres` user.

On the App server, the following containers, orchestrated via
`docker/app_server/docker-compose.prod.yml`, are:

- **liftedmobile**
    - Defined in `docker/app_server/liftedmobile.prod.dockerfile`
    - Like `admin_cms`, this container runs Gunicorn and Nginx to serve
      the Django project at `src/lm`.
    - Configuration files:
        - `docker/app_server/nginx.conf`

- **liftedmobile_tlsproxy**
    - Defined in `docker/app_server/tlsproxy.prod.dockerfile`
    - All traffic to the **liftedmobile** container passes through this
      container, which is an Nginx reverse proxy running on an `nginx:alpine`
      image.
    - This image is intended to provide easy TLS configuration for the App
      using Let's Encrypt. At the moment, CloudFront provides SSL/TLS
      protection, and the link between CloudFront and EC2 is not protected by
      TLS. This will be rectified, but is an acceptable compromise because
      said link is internal to the AWS network.
    - Configuration files:
        - `docker/app_server/nginx.conf.tlsproxy`

- **liftedmobile_db**
    - Defined in `docker/app_server/db.prod.dockerfile`
    - Configuration files:
        - `./docker/app_server/db.init.sql`: creates a database called
          `liftedmobile` and grants access privileges to the `postgres` user.

#### The `wait_for_postgres.py` script

`wait_for_postgres.py` reads Django's `settings.py` for information about how
to connect to the database so that it can run the `pg_isready` command at
regular intervals until it exits successfully.  Each `CMD` directive in the
`liftedmobile` and `admin_cms` Dockerfiles execute this script to ensure that
their corresponding web server launches after the database is ready. Otherwise,
the web servers will not start up reliably.

### The Django project

Both the App and CMS run the same Django project code located at `src/lm`.

This project contains two apps: `cms` and `app`. Only the CMS server runs `cms`
and `app`, while the App server only runs `app`. This is possible because the
`admin_cms` container is configured by Docker Compose to have the environment
variable `CMS` set to `true` via `docker/admin_server/docker-compose.prod.yml`.
The code in `src/lm/lm/settings.py` checks whether this environment variable
exists, and if it does, it enables the `cms` app as an installed app:

```python
if 'CMS' in os.environ:
    INSTALLED_APPS.append("cms")
```

This means that even though the App server contains code for both `app` and
`cms`, including each of their views and URL routes, but because Docker Compose
sets the `CMS` environment variable, only the CMS server will enable the `cms`
Django app. 

`settings.py` also looks for the `CMS` environment variable to selectively
modify or add the following configuration settings **in production** as such:

- `SCRAPYD_IP`: the internal IP address of the `admin_scrapyd` container
- `SESSION_COOKIE_NAME`: the Django session cookie name. This setting is
  modified to prevent a cookie namespace clash with `app`.
- `SECRET_KEY`: the Django secret key will be read from
  `/run/secrets/django_secret`
- `SERVER_EMAIL`: deprecated and should be removed
- `CMS_TEMP_SUPER_USERNAME`: the username of the CMS administrator
- `CMS_TEMP_SUPER_PASSWORD`: reads the CMS administrator's password from
  `/run/secrets/cms_admin_pwd`
- `SCRAPYD_API_KEY`: reads a secret key from `/run/secrets/scrapyd_api_key` for
  authentication between the `admin_scrapyd` container and the `admin_cms` server.
  More information about interaction between these two containers can be found in
  the section about the scraper.
- `LOGIN_REDIRECT_URL`: ensures that after a successful login ,the Django
  authentication system will redirect the user to `/cms`.
- `TEMPLATES`: adds the `export_vars` function defined in
  `src/lm/cms/context_processors.py` as a template context processor. This
  allows the `src/lm/cms/templates/cms/base.html` template to access the `DEV`
  environment variable and thereby selectively load static assets from the
`preact watch` server in development, or from `/static` in production. More
information about the development environment can be found in the
[Development](/development.html) section.

### Ports used

|Number|Service|Notes|
|---|---|---|
|2233|SSH|It is a best practice to not use port 22 for SSH|
|5544|Postgres|Restricted to traffic between the App and CMS servers|
|80|HTTP|For the App server|
|9001|HTTP|For the CMS|

### The App and CMS databases
<!--TODO: how initial data gets loaded -->
<!--TODO: how the Django code separates the CMS and App -->

## Frontend architecture

The frontend is, broadly speaking, a Single-Page Application. A single
JavaScript app, developed using the Preact user interface library, LESS for
stylesheets, Webpack for module bundling, and Babel for ES2015 transpilation,
comprises the frontend code. URL routes are handled by `preact-router`.

<!--TODO: how to add a new route, relationship between urls.py and preact-router -->

### Architectural considerations
<!--TODO: why Preact?-->
<!--TODO: why preact-cli?-->
<!--TODO: static files -->

## Code license extractor
<!--TODO -->
