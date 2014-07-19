mean-local-auth
===============

## Table of Contents

* [Demo](#demo)
* [Description](#description)
* [Stack](#stack)
* [Overview of the code](#code-overview)
* [How to use mean-local-auth to kickstart your project](#how-to-use)
* [License](#license)

##<a name="demo"></a>Demo
Check it out: [https://meanlocalauth.com](https://meanlocalauth.com)

##<a name="description"></a>Description

mean-local-auth is a seed/starter app for any project that requires local authentication (as opposed to sign-in via Twitter, Facebook, etc.). mean-local-auth provides sign-up, sign-in, and password resetting functionality.

**Sign-up** involves creating a username and password and specifying an email address for the user account. Usernames and email addresses must be unique; mean-local-auth dynamically checks whether a username and email are available as the user completes the sign-up form. mean-local-auth also checks that the user's password meets requirements (at least 8 characters, 1 numeral, and 1 uppercase letter). This validation is performed on both the client and server side.

**Sign-in** is what you'd expect, plus the following:
* Users can sign in using their username *or* email address.
* mean-local-auth implements client-side validation of the password, to make sure it meets requirements, before sending a request to the server.
* A Bootstrap alert is displayed after invalid sign-in attempts.

**Password resetting** is accomplished using the password-reset-nodemailer node module, which implements the best practice of emailing the user a link containing an expiring token that allows them to choose a new password. mean-local-auth is configured to use AWS's Simple Email Service to send these password reset emails.

##<a name="stack"></a>Stack

Core architecture:


##<a name="code-overview"></a>Overview of the code

`/lib` contains server-side app code.

`/node_modules_custom` contains node modules whose source code has been modified for custom use with the app. `/node_modules_custom/orig` contains unmodified copies of the modified node modules.

`/public` contains all front-end assets like Angular.js code.

`/sysadmin` contains files supporting the deployment and systems-administration of the app. See the  [next section](#how-to-use) for more info.

`/test` contains all code related to the testing of the app. Currently, integration tests cover all server endpoints.

mean-local-auth doesn't use a build tool like Grunt or Gulp. Hence there is no minification, CSS preprocessing, etc. Better to leave those choices up to the developer.

mean-local-auth also doesn't distinguish between development/staging/production environments; that is again left to the developer.

##<a name="how-to-use"></a>How to use mean-local-auth to kickstart your project

Of course, you can always extract any parts of the code that are useful to you. But mean-local-auth comes with Ansible playbooks which can deploy your very own version of the app, with just a little configuration. For very little work, you'll have:
* an Angular app supporting local authentication,
* backed by an Express 4 server
* and a Mongo database,
* using Redis for session support
* and Nginx as a reverse-proxy serving static files and redirecting all connections over HTTPS.

These Ansible playbooks are written to deploy the app to one server, but they can easily be adapted to create a scalable multi-tiered architecture.

#### Deploying mean-local-auth for the first time:

1. Fork the mean-local-auth repo so that you have your own copy.

1. On your local development machine, create an RSA keypair for SSHing into the server where you'll deploy mean-local-auth. mean-local-auth assumes this keypair will be called `mean-local-auth` and will be located in `~/.ssh`. You can use the following command:
        ssh-keygen -t rsa -f ~/.ssh/mean-local-auth -N ''

1. Create a server with your favored cloud provider (e.g. DigitalOcean, AWS). It should run Ubuntu 14.04 x64. When creating your server, specify `mean-local-auth.pub` for use with SSH.

1. From within `/sysadmin/dev`, configure `/groups_vars/all` for your situation:

    * For `forked_repo_url`, specify the URL of your fork (created in step 1) of the mean-local-auth repo.

    Note that if your fork is private, you will need to customize the `Clone your fork of the mean-local-auth repo` task in `/sysadmin/dev/roles/node/tasks/main.yml` with the authentication credentials necessary to clone your repo.
    * Specify the IP of the server where the app will be deployed, in the `meanlocalauth_ip` variable.
    * mean-local-auth assumes you'll be SSHing into your server from a VPN or at least a static IP. Specify the IP you'll be connecting to your server from, in the `vpn_ip` variable. This is the only IP address which will have SSH access to your server.
    * In `new_ssh_port`, you can specify an alternate port to connect via SSH, if you don't like 22. If you do choose an alternate, make sure it's less than 1024.
    * Provide an email address in `logwatch_email` and `fail2ban_email` where you'll receive monitoring emails from these services.
    * Provide crypted passwords for the root and deploy users. In case you don't know how to hash a password, the comment above `root_password` and `deploy_password` contains instructions.

1. Configure `/group_vars/mongoservers` for your situation:
    * Choose a password for the master user of your Mongo database.
    * Choose a password for app_db_user (the user which the app will connect to the database as).

1. If you already have an SSL certificate and private key for your server, place them in `/sysadmin/dev/roles/nginx/files`. Update lines 55 and 56 of `/sysadmin/dev/roles/nginx/templates/nginx.conf.j2` with the filenames of your certificate and key. If you need to generate your own certificate and key, you may use:
        cd sysadmin/dev/roles/nginx/files
        sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout server.key -out server.crt

    Update lines 55 and 56 with server.crt and server.key respectively.

    Note that if you use a self-signed SSL certificate, for the tests in ``/test/express/auth.js` to work you will need to ensure you have set
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    at the beginning of `/test/express/auth.js`.

1. Configure `/lib/config/config.json`:
    * For `db.password`, enter the `app_db_user_password` you specified in `/sysadmin/dev/group_vars/mongoservers`.
    * Choose secrets for `secrets.cookieParser` and `secrets.session`.
    * For `publicDNS`, enter the domain name (e.g. example.com) or IP address of your server.
    * In `testing.email` and `testing.email2`, enter different email address that can be used by the tests in `/test/express/auth.js` to test the creation of user accounts.
    * In `AWSSES`, enter the access key id and secret access key associated with your AWS account. These credentials are used to send password reset emails via AWS's Simple Email Service. If you prefer to use a different provider for sending password reset emails, you would customize `forgot` within `/lib/routes/passwordReset.js`.

5. From within `/sysadmin/dev`, run:
        ansible-playbook -i development site.yml -vvvv
    That's it! If the playbook finished without error, as it should have, your own version of mean-local-auth will be up and running!


#### Upgrading your app code

As you modify mean-local-auth, you'll want to update the code on your server. To do that, from within `/sysadmin/dev`, just run:

    ansible-playbook -i development upgrade_app_code.yml -vvvv -e ansible_ssh_port=22

`ansible_ssh_port` should be set to whatever you specified for `new_ssh_port` in `/sysadmin/dev/group_vars/all`.

##<a name="license"></a>License

See LICENSE

Seed app supporting local authentication, using MongoDB, Express4, and AngularJS

In your own project, you'll want to add config.json to your .gitignore file.

Sysadmin:

Assumes user uses some VPN or at least has static IP, from which to SSH into app servers and control them

Explain use of maintenance.html

How to configure:

Instructions:
On your local dev machine:

fill out config.json
also complete all and mongoservers files in /group_vars

run ansible playbook

Other comments:
Note if you wish to keep group_vars files in version control but their contents private, you can use ansible-vault to encrypt them


Some features of the app:
- has a loading page that displays until the angular app is loaded
