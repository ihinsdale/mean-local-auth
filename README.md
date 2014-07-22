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

Screenshots:

<img src="https://raw.githubusercontent.com/ihinsdale/mean-local-auth/master/screenshots/signup.png" alt="Sign up screenshot" width="300px"/>
<img src="https://raw.githubusercontent.com/ihinsdale/mean-local-auth/master/screenshots/signin.png" alt="Sign in screenshot" width="300px"/>
<img src="https://raw.githubusercontent.com/ihinsdale/mean-local-auth/master/screenshots/passwordresetrequest.png" alt="Password reset request screenshot" width="300px"/>
<img src="https://raw.githubusercontent.com/ihinsdale/mean-local-auth/master/screenshots/changepassword.png" alt="Change password screenshot" width="300px"/>
<img src="https://raw.githubusercontent.com/ihinsdale/mean-local-auth/master/screenshots/successfulpasswordchange.png" alt="Successful password change screenshot" width="300px"/>

##<a name="description"></a>Description

mean-local-auth is a seed/starter app for any project that requires local authentication (as opposed to sign-in via Twitter, Facebook, etc.). mean-local-auth provides sign-up, sign-in, and password resetting functionality.

**Sign-up** involves creating a username and password and specifying an email address for the user account. Usernames and email addresses must be unique; mean-local-auth dynamically checks whether a username and email are available as the user completes the sign-up form. mean-local-auth also checks that the user's password meets requirements (at least 8 characters, 1 numeral, and 1 uppercase letter). This validation is performed on both the client and server side.

**Sign-in** is what you'd expect, plus the following:
* Users can sign in using their username *or* email address.
* mean-local-auth implements client-side validation of the password, to make sure it meets requirements, before sending a request to the server.
* A Bootstrap alert is displayed after invalid sign-in attempts.

**Password resetting** is accomplished using the password-reset-nodemailer node module, which implements the best practice of emailing the user a link containing an expiring token that allows them to choose a new password. mean-local-auth is configured to use AWS's Simple Email Service to send these password reset emails.

##<a name="stack"></a>Stack

### Front-end

![AngularJS](https://raw.githubusercontent.com/ihinsdale/mean-local-auth/master/readme_badges/angular.png)

![Bootstrap](https://raw.githubusercontent.com/ihinsdale/mean-local-auth/master/readme_badges/bootstrap.png)


### Back-end

![Node.js](https://raw.githubusercontent.com/ihinsdale/mean-local-auth/master/readme_badges/nodejs.png)

![Express](https://raw.githubusercontent.com/ihinsdale/mean-local-auth/master/readme_badges/express.png)

![MongoDB](https://raw.githubusercontent.com/ihinsdale/mean-local-auth/master/readme_badges/mongodb.png)

![Redis](https://raw.githubusercontent.com/ihinsdale/mean-local-auth/master/readme_badges/redis.png)

![Nginx](https://raw.githubusercontent.com/ihinsdale/mean-local-auth/master/readme_badges/nginx.png)

### Configuration management

![Ansible](https://raw.githubusercontent.com/ihinsdale/mean-local-auth/master/readme_badges/ansible.png)

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

1. Fork the mean-local-auth repo, and clone your fork on your local development machine.

1. Within the project directory, run `bower install` and `npm install` to install dependencies.

1. On your local development machine, create an RSA keypair for SSHing into the server where you'll deploy mean-local-auth. mean-local-auth assumes this keypair will be called `mean-local-auth` and will be located in `~/.ssh`. You can use the following command:

        ssh-keygen -t rsa -f ~/.ssh/mean-local-auth -N ''

1. Create a server with your favored cloud provider (e.g. DigitalOcean, AWS). It should run Ubuntu 14.04 x64. When creating your server, specify `mean-local-auth.pub` for use with SSH.

1. If you already have an SSL certificate and private key for your server, place them in `/sysadmin/dev/roles/nginx/files` in your clone of the mean-local-auth repo. Update lines 55 and 56 of `/sysadmin/dev/roles/nginx/templates/nginx.conf.j2` with the filenames of your certificate and key.

    If you need to generate your own certificate and key, you may use:

        cd sysadmin/dev/roles/nginx/files
        sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout server.key -out server.crt

    Use your domain name, if you have one, or the IP address of your server for the certificate's Common Name. Update lines 55 and 56 with server.crt and server.key respectively. Note that if you use a self-signed SSL certificate, for the tests in ``/test/express/auth.js` to work you will need to ensure you have set

        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

    at the beginning of `/test/express/auth.js`.

1. You may want to add your SSL certificate and key files to your .gitignore.

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

1. If you wish to keep the contents of the `/group_vars` files private, but still tracked in version control, you can use [ansible-vault](http://docs.ansible.com/playbooks_vault.html) to encrypt them. From within `/group_vars`, you can use the command:

        ansible-vault encrypt all mongoservers nginxservers redisservers

1. Configure `/lib/config/config.json`:
    * For `db.password`, enter the `app_db_user_password` you specified in `/sysadmin/dev/group_vars/mongoservers`.
    * Choose secrets for `secrets.cookieParser` and `secrets.session`.
    * For `publicDNS`, enter the domain name (e.g. example.com) or IP address of your server.
    * For `passwordResetSenderEmail`, enter an email address you control. This email address will be the sender of password reset emails.
    * In `AWSSES`, enter the access key id and secret access key associated with your AWS account. These credentials are used to send password reset emails via AWS's Simple Email Service (SES). To successfully send password reset emails, you will need to login to SES and follow the necessary steps to verify the email address you specified in `passwordResetSenderEmail`. If your SES account uses a region other than us-east-1, update `AWSSES.regionUrl` accordingly.

        If you prefer to use a different provider for sending password reset emails, you would customize `forgot` within `/lib/routes/passwordReset.js`.
    * In `testing.email` and `testing.email2`, enter different email addresses that can be used by the tests in `/test/express/auth.js` to test the creation of user accounts.

1. If you don't want your configuration information/credentials to be stored in version control, add a line for config.json to your .gitignore file, then type:

        git rm --cached lib/config/config.json

    to untrack the file from your repo. Then commit and push to origin.

1. In the `/sysadmin/dev/development` inventory file, replace all four instances of `ansible_ssh_host=` with the IP address of your server. This will be the same IP you used to define `meanlocalauth_ip` in `/group_vars/all`.

1. You are now ready to deploy. From within `/sysadmin/dev`, run:

        ansible-playbook -i development site.yml -vvvv

    If you used ansible-vault to encrypt your `/group_vars` files, you will need to add the `--ask-vault-pass` flag to this command.

That's it! If the playbook finished without error, as it should have, your own version of mean-local-auth will be up and running. In a browser, navigate to your server's address and see!

This deployment procedure has been tested successfully multiple times. Nevertheless, if you have any problems, please open an [issue ticket](https://github.com/ihinsdale/mean-local-auth/issues).

#### Upgrading your app code

As you modify mean-local-auth, you'll want to update the code on your server. To do that, from within `/sysadmin/dev`, just run:

    ansible-playbook -i development upgrade_app_code.yml -vvvv -e ansible_ssh_port=22

Two things to note about this command:
* If you used ansible-vault to encrypt your `/group_vars` files, you will need to add the `--ask-vault-pass` flag to this command.

* `ansible_ssh_port` should be set to whatever you specified for `new_ssh_port` in `/sysadmin/dev/group_vars/all`.

##<a name="license"></a>License

See LICENSE
