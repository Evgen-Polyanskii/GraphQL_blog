setup: install db-create db-migrate data-load

start:
	heroku local -f Procfile

db-create:
	npx sequelize-cli db:create

db-migrate:
	npx sequelize-cli db:migrate

db-delete-migrate:
	npx sequelize-cli db:migrate:undo:all

data-load:
	npx sequelize-cli db:seed:all

db-reset: db-delete-migrate db-migrate data-load

install:
	npm install

dev:
	npx nodemon server/bin/server.js

lint:
	npx eslint .

test:
	npm test

.PHONY: test
