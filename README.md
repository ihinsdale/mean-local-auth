mean-local-auth
===============

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
