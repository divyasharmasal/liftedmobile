# LIFTED Mobile

A learning needs diagnostic tool for legal professionals, developed for the
Singapore Academy of Law by Koh Wei Jie.

## Development

### Getting the source code

All the source code for LIFTED Mobile can be cloned via `git`. There are two
repositories, which should be kept identical for the sake of redundancy:

`ssh://git-codecommit.eu-west-1.amazonaws.com/v1/repos/liftedmobile`
`git@github.com:weijiekoh/liftedmobile.git`

#### The AWS Repository

This is hosted via AWS CodeCommit. The only user currently in control of the
repository is `liftedmobile`. The SSH key of this account is controlled by KWJ.

### The GitHub Repository

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


### Installing Python requirements

To get started with developing the LIFTED Mobile source code, set up your
development environment by creating the Python 3 virtual environment and
installing requirements. The following only has to be run the first time you
work on the backend components written in Python 3.

```
cd liftedmobile/src
python3 -m venv venv && \
            source venv/bin/activate && \
            pip3 install --upgrade pip && \
            pip3 install -r requirements.txt
            ```

            For subsequent times, simply run:

            ```
            cd liftedmobile/src
            source venv/bin/activate 
            ```

            ... and you're good to go.

### Updating Python requirements

            If you use `pip3 install` to add any Python packages to the virtual
            environment, make sure to update `requirements.txt` as well:

            ```
            pip3 freeze > requirements.txt
            ```

            Run `pip3 install -r requirements.txt` to install all the packages listed in `requirements.txt`.
