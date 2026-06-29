# Dev + CI/CD orchestration. Thin wrapper over the npm scripts so the same verbs
# serve local dev and CI. `make` is in every CI image — no extra tooling to install.
#
# Run `make` or `make help` to list targets.

.DEFAULT_GOAL := help
.PHONY: help dev dev-down deps gate e2e

help: ## List available targets
	@grep -E '^[a-zA-Z0-9_-]+:.*## ' $(MAKEFILE_LIST) \
		| sort \
		| awk 'BEGIN {FS = ":.*## "} {printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}'

dev: ## Bring dev dependencies up (--wait) and start the dev server (one command)
	npm run dev

dev-down: ## Stop dev dependency containers (data volume retained)
	npm run dev:down

deps: ## Bring dev dependencies up only (compose up -d --wait), no server
	npm run dev:deps

gate: ## CI gate: test + build (blocking); lint (non-blocking until debt cleared)
	npm test
	npm run build
	@echo "── lint (non-blocking; TODO: make blocking once the 55-error debt is cleared) ──"
	-npm run lint

e2e: ## Run Playwright e2e against an already-running app (override with BASE_URL=...)
	npm run test:e2e
