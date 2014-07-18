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

##<a name="how-to-use"></a>How to use mean-local-auth to kickstart your project

mean-local-auth uses Ansible to handle server configuration and deployment of code.

To deploy mean-local-auth on a fresh server, follow this procedure:

1. On your local development machine, create an RSA keypair for SSHing into the server where you'll deploy mean-local-auth. mean-local-auth assumes this keypair will be called `mean-local-auth` and will be located in `~/.ssh`. You can use the following command:

        ssh-keygen -t rsa -f ~/.ssh/mean-local-auth -N ''

2. Create your server running Ubuntu 14.04 x64 (e.g. using DigitalOcean or AWS EC2), specifying `mean-local-auth.pub` for use with SSH.

3. If you already have an SSL certificate and private key for your server, place them in `/sysadmin/dev/roles/nginx/files`. Update lines 55 and 56 of `/sysadmin/dev/roles/nginx/templates/nginx.conf.j2` with the filenames of your certificate and key. If you need to generate your own certificate and key, you may use:

        cd sysadmin/dev/roles/nginx/files
        sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout server.key -out server.crt

    Update lines 55 and 56 with server.crt and server.key respectively.

    Note that if you use a self-signed SSL certificate, you will need to ensure that you use 

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
