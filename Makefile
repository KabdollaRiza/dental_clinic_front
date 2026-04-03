.PHONY: install dev build preview lint lint-fix clean

install:
	npm install

dev:
	npm run dev

build:
	npm run build

preview:
	npm run preview

lint:
	npm run lint

lint-fix:
	npm run lint:fix

clean:
	rm -rf dist node_modules
