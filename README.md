mean-local-auth
===============

Seed app supporting local authentication, using MongoDB, Express4, and AngularJS

In your own project, you'll want to add config.json to your .gitignore file.

Sysadmin:

Assumes user uses some VPN or at least has static IP, from which to SSH into app servers and control them

Explain use of maintenance.html

How to configure:

On your local dev machine:

fill out config.json
also complete all and mongoservers files in /group_vars

run ansible playbook
