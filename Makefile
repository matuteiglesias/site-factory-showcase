SHELL := /bin/bash
.SHELLFLAGS := -eu -o pipefail -c

.PHONY: help check test smoke run build clean

help:
	@echo "Site Factory Showcase command surface"
	@echo ""
	@echo "Prerequisite: install locked dependencies with npm ci."
	@echo ""
	@echo "  make check  Run the complete native verification pipeline"
	@echo "  make test   Run the Vitest suite"
	@echo "  make smoke  Run the bounded local smoke script"
	@echo "  make run    Start the Next.js development server"
	@echo "  make build  Build the production application"
	@echo "  make clean  Remove generated Next.js output"

check:
	npm run check

test:
	npm run test

smoke:
	npm run smoke

run:
	npm run dev

build:
	npm run build

clean:
	rm -rf .next
