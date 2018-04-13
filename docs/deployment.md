# Deployment

## AWS setup

### IAM: users and permissions

To use this guide, first create an Amazon Web Services account and log in. If
you already have an account, this master account should have full
administorator rights and two-factor authentication enabled. The only time you
need to use the master account should be to create the following subaccounts:

|User|Managed Access Policies|Programmatic Access|Management Console Access|Notes|
|---|---|---|
|`lm_ec2`|`AmazonEC2FullAccess`|No|Yes|- |
|`lm_route53`|`AmazonRoute53DomainsFullAccess`|No|Yes|- |
|`lm_cloudwatch`|See below|Yes|No|- |

Make sure that you save the Access key ID and Access secret for `lm_cloudwatch`
somewhere safe.

Also set up two-factor authentication for all accounts with management console
access. Bookmark the Mangagement Console URL for convenient access:

```
https://<your account number>.signin.aws.amazon.com/console
```

#### Policy for `lm_cloudwatch`

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Action": [
                "logs:CreateLogStream",
                "logs:PutLogEvents",
                "logs:CreateLogGroup"
            ],
            "Effect": "Allow",
            "Resource": "*"
        }
    ]
}
```

The purpose of this strategy is to reduce the impact on the system if any
particular account is comprimised. Depending on your threat model, you may
choose to take this risk and use the master account to administer everything. 

You may also choose to customise access policies to your needs. This is a
highly granular task, so the table above simply lists relevant Managed Access
Policies.

## Building the App and CMS containers

To build both the App and CMS containers, run:

```bash
./scripts/admin_server/prod/build_prod.sh
```

Expect this script to take up to 20 minutes even on a fast connection.

To only build the App container, run:

```bash
./scripts/app_server/prod/build_prod.sh
```

Expect this script to take up to 10 minutes even on a fast connection.

### EC2: virtual servers

Log in to the AWS Management Console using your `lm_ec2` credentials and navigate to the 
[EC2 console](https://ap-southeast-1.console.aws.amazon.com/ec2/v2/home?region=ap-southeast-1#Instances:sort=instanceId).

Note that this guide assumes that you are using the `ap-southeast-1` AWS
region, which is hosted in Singapore..

Create two new instances. Each instance should be configured as such:

- AMI: Ubuntu Server 16.04 LTS (HVM), SSD Volume Type - ami-52d4802e (64-bit)
- Instance Type: t2.nano (or t2.micro)
- Protect against accidental termination
- Storage: default 8GB general purpose SSD

Next, create 2 Elastic IPs (VPC) and assign one to each new instance.

Finally, rename each instance for your convenience:

| Instance name | Elastic IP (example) |
|-|-|
| app_server | 52.76.154.41 |
| cms_server | 52.77.56.112 |

If you create a new secret `.pem` file (e.g. `secret.pem`), change its
permissions to read-only:

```bash
chmod 400 /path/to/secret.pem
```

#### Security group setup

Set up one security group each for `app_server` and `cms_server`.

Inbound rules for `app_server`:

| Protocol | Port | Source  | Description |
|-|-|-|-|
| TCP | 5544 | 52.77.56.112/32 (the `cms_server` IP) | From CMS DB |
| TCP | 80 | 0.0.0.0/0 | HTTP |
| TCP | 443 | 0.0.0.0/0 | HTTPS |
| SSH | 22 | 0.0.0.0/0 | Old SSH |
| SSH | 2233 | 0.0.0.0/0 | New SSH |

Inbound rules for `cms_server`:

| Protocol | Port | Source  | Description |
|-|-|-|-|
| TCP | 80 | 0.0.0.0/0 | HTTP |
| TCP | 443 | 0.0.0.0/0 | HTTPS |
| SSH | 22 | 0.0.0.0/0 | Old SSH |
| SSH | 2233 | 0.0.0.0/0 | New SSH |

## SSH configuration

Log in to `app_server` via SSH:

```bash
ssh -p 22 -i /path/to/secret.pem ubuntu@52.76.154.41
```

Change `/etc/ssh/sshd_config` to contain the contents of [this page](./sshd_config.txt).

This configuration file changes some default settings for better security, including:

- Changes the SSH port to 2233 to avoid most bots
- Disallow root login
- Disallow X11Forwarding

Reboot once you have changed `sshd_config`:

```bash
sudo reboot
```

Once you have reconfigured `sshd` such that the port number is `2233`, delete
the "Old SSH" rule from each security group.

You may now log in via port `2233`:

```bash
ssh -p 2233 -i /path/to/secret.pem ubuntu@52.76.154.41
```

Do the same for `cms_server`.

## Postgres database setup

On both servers, do the following:

```bash
sudo apt update && sudo apt -y upgrade && sudo apt -y install postgresql
```

Edit `/etc/postgresql/9.5/main/postgresql.conf` to change the following:

```
listen_addresses = '0.0.0.0,172.16.0.1,172.17.0.1,172.18.0.1'
port = 5544
```

In `app_server`, edit `/etc/postgresql/9.5/main/pg_hba.conf` to add:

```
hostssl    liftedmobile  postgres       172.16.0.0/12           md5
hostssl    liftedmobile  postgres       <cms_server IP>/32         md5
```

In `cms_server`, edit `/etc/postgresql/9.5/main/pg_hba.conf` to add:
```
hostssl    admin  postgres       172.16.0.0/12           md5
```

Restart Postgres once you change both files:

```bash
sudo service postgresql restart
```

Change the password for the `postgres` user:

```bash
sudo -u postgres psql
alter user postgres with encrypted password 'SECURE PASSWORD HERE';
```

Press Control-D to exit `psql` and return to the shell.

In `app_server`, create a databased named `liftedmobile`:

```bash
sudo -u postgres createdb liftedmobile
```

In `cms_server`, create a databased named `admin`:

```bash
sudo -u postgres createdb admin
```

You should now be able to access the `app_server` database from the
`cms_server` database, but not via any other IP address:

```bash
sudo -u postgres psql -h <app_server IP> -p 5544 -U postgres liftedmobile
```

## Route 53: DNS setup

Create four subdomains:

1. `app.lifted.sg`
    - The public will access the app here
    - Set it up to point to CloudFront later - see below
2. `cms.lifted.sg`
    - LIFTED administrators will log in to the CMS here
    - Set it up to point to CloudFront later - see below
3. `app-prod.lifted.sg`
    - Serves as the origin server to CloudFront
    - Set up an `A` record with the IP address of the App server
4. `cms-prod.lifted.sg`
    - Serves as the origin server to CloudFront
    - Set up an `A` record with the IP address of the CMS server

## Docker setup

Install Docker and Docker Compose on both servers. Use the instructions in the
[Development](./development.html) section.

## Secret and configuration setup

You need to generate several long and random strings:

1. `DJANGO_SECRET` for the app server
2. `DJANGO_SECRET` for the CMS server
3. The administrator password for the CMS
4. The authentication key used between the scraper and the CMS server

If run on Linux, this command uses entropy from `/dev/urandom` to generate a
100-character long alphanumeric secret. You are, however, responsible for the
randomness and security of each secret string you produce.

```bash
python -c "import random; import string; print(''.join(random.SystemRandom().choice(string.ascii_uppercase + string.ascii_lowercase + string.digits) for _ in range(100)))"
```

### App server

SSH into the app server and create a directory named `LM_SECRETS` in `/home/ubuntu/`

```bash
mkdir /home/ubuntu/LM_SECRETS
```

Create `/home/ubuntu/LM_SECRETS/app_secrets.json`:

```
{
    "django_secret": "<long and random string>",
    "db_config": {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": "liftedmobile",
            "USER": "postgres",
            "PASSWORD": "<postgres password>",
            "HOST": "dockerhost",
            "PORT": "5544"
        }                         
    },
    "certbot_config": {
        "run_certbot": true,
        "email": "<your email address>",
        "domain": "app-prod.lifted.sg"
    },
    "cloudwatch_config": {
        "access_key_id": "<lm_cloudwatch user access key>",
        "secret_access_key": "<lm_cloudwatch user secret access key>",
        "region_name": "ap-southeast-1"
    }
}
```

### CMS server

```
{
    "django_secret": "<long and random string #2>",
    "db_config": {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": "admin",
            "USER": "postgres",
            "PASSWORD": "<password for the Postgres user 'admin'>",
            "HOST": "dockerhost",
            "PORT": "5544"
        },
        "app_server": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": "liftedmobile",
            "USER": "postgres",
            "PASSWORD": "<password for the Postgres user 'postgres'>",
            "HOST": "<IP address of the app server>",
            "PORT": "5544"
        }
    },
    "certbot_config": {
        "run_certbot": true,
        "email": "<your email address>",
        "domain": "<cms_server subdomain>"
    },
    "cms_admin_pwd": "<long and random string #3>",
    "scrapyd_api_key": "<long and random string #4>",
    "cloudwatch_config": {
        "access_key_id": "<lm_cloudwatch user access key>",
        "secret_access_key": "<lm_cloudwatch user secret access key>",
        "region_name": "ap-southeast-1"
    }
}
```

## Set up Docker logging drivers for CloudWatch

Docker needs to be configured to send server logs to AWS CloudWatch. To do so,
SSH into the App and CMS servers and follow these instructions for both.

Run:

```bash
sudo mkdir -p /etc/systemd/system/docker.service.d/ && \
sudo touch /etc/systemd/system/docker.service.d/aws-credentials.conf
```

Edit `/etc/systemd/system/docker.service.d/aws-credentials.conf`

```
[Service]
Environment="AWS_ACCESS_KEY_ID=<aws_access_key_id>"
Environment="AWS_SECRET_ACCESS_KEY=<aws_secret_access_key>"
```

Finally, run:

```bash
sudo systemctl daemon-reload && sudo service docker restart
```


## Pushing containers to production servers

Build the app and CMS:

```bash
./scripts/admin_server/prod/build_prod.sh
```

These are the images that you will next push to the production servers:

```bash
adminserver_cms          latest      213MB
adminserver_scrapyd      latest      182MB
adminserver_db           latest      38.2MB
appserver_tlsproxy       latest      103MB
appserver_liftedmobile   latest      210MB
appserver_db             latest      38.2MB
```

Note that the largest image is only 213MB in size. It is tiny in comparision to
those produced in other projects because each Dockerfile configures the image
to uses Alpine Linux and delete unused files.

Next, run the deployment script:

```bash
./scripts/deploy.py -p 2233 -c /home/di/Desktop/SAL/lm_demo.pem -u ubuntu@demo-app.lifted.sg -s ./ -t app
./scripts/deploy.py -p 2233 -c /home/di/Desktop/SAL/lm_demo.pem -u ubuntu@demo-cms.lifted.sg -s ./ -t cms
```

To view the commands that the script will execute without executing them, add
the `-d` flag to do a dry run.

## CloudFront setup

For the app, create a CloudFront distribution with the following settings:

- SSL certificate: create a custom SSL certificate for `app.lifted.sg`
- Price Class: Use Only US, Canada, Europe and Asia
- Alternate Domain Names (CNAMEs): app.lifted.sg
- Origin
    - Origin Domain Name: app-prod.lifted.sg
    - Origin Protocol Policy: HTTPS
    - HTTPS Port: 443
- Behaviours
    - Precedence 0
        - Path pattern: `static/*`: 
        - Allowed HTTP Methods: GET, HEAD
        - Object Caching: ￼Use Origin Cache Headers
        - Forward Cookies: None
        - Query String Forwarding and Caching: None
        - Compress Objects Automatically: Yes
    - Precedence 1
        - Path pattern: `Default (*)`
        - Allowed HTTP Methods: GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE
        - Cache Based on Selected Request Headers: Whitelist
        - Whitelist Headers: Host
        - Object Caching: Customise
        - Minimum/Maximum/Default TTL: 0
        - Forward Cookies: All
        - Query String Forwarding and Caching: Forward all, cache based on all
        - Compress Objects Automatically: Yes

Follow the equivalent steps for the CMS.

Next, link the domain intended for public use to the CloudFront distribution URL via
Route53. Create an A record from `app.lifted.sg` to `dxxxxxx.cloudfront.net.`
and make sure that `Alias` is set to `Yes`. After about 30 minutes, you should
be able to access the app via `app.lifted.sg`.
