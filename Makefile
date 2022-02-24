setup: install db-create db-migrate

db-create:
	npx sequelize-cli db:create

db-migrate:
	npx sequelize-cli db:migrate

install:
	npm install

dev:
	npx nodemon server/bin/server.js

lint:
	npx eslint .

test:
	npm test
