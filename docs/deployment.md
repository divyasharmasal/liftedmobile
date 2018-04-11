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

Also set up two-factor authentication for all accounts with management console
access.

Bookmark the Mangagement Console URL for convenient access:

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

If you create a new secret `.pem` file (e.g. `secret.pem`), change its permissions to read-only:

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
hostssl    liftedmobile  postgres       <cms_server IP>/32         md5
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

## Docker setup

Install Docker and Docker Compose on both servers. Use the instructions in the
[Development](./development.html) section.

## Secret and configuration setup

## Pushing containers to production servers

### Route 53: DNS setup

### CloudFront setup
