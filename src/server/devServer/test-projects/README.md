# Example projects

This folder contains some sample docker-compose files that can be used to spin up an open source project for testing purposes.

## Redmine

- Postgres database with 50+ tables
- Tables with populated content out-of-the-box: users, roles

```shell
# 1. Start redmine + postgres
$ docker-compose -f src/server/devServer/test-projects/redmine.docker-compose.yml up -d
# 2. Run Helppo against it
$ yarn dev postgres://postgres:example@127.0.0.1:7911/postgres
```

## WordPress

- Mysql database with 10+ tables
- Tables with populated content after installation: wp_posts, wp_options, wp_usermeta
- Notable: no foreign keys in use, invalid date values ("0000-00-00 00:00:00")

```shell
# 1. Start wp + mysql
$ docker-compose -f src/server/devServer/test-projects/wordpress.docker-compose.yml up -d
# 2. Open http://localhost:7912 and run through the installation process
$ open http://localhost:7912
# 3. Run Helppo against it
$ yarn dev mysql://exampleuser:examplepass@127.0.0.1:7913/exampledb
```
