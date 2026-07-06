# Slice 2026-07-03--05 — Dokploy deploy: setup guide + IaC

**Status:** planning
**Started:** 2026-07-03
**Finished:** —

## Plan reference

Child of the release-engineering epic
([2026-07-03--02](2026-07-03--02--release-management-tooling.md)) — see it for the **Dokploy
IaC + build-topology research spike** that settled the approach. Delivers a reproducible
Dokploy deploy target on the local Proxmox host that the `test` branch deploys to.

**Definition of done:**
- A **setup guide/checklist** for the Dokploy instance on Proxmox, incl. the **build
  topology** (builds run on the same Proxmox as Dokploy).
- **API/CLI-based IaC** for the Dokploy projects/apps/domains (committed declarative config
  + a thin apply script using the Dokploy REST API / official CLI, `x-api-key` auth) so the
  target is recreatable from source.
- Apps deploy from the repo's existing **Dockerfiles / docker-compose** (Dokploy
  Dockerfile / Compose service types — **no Nixpacks**).
- **ADR** for the IaC approach + build topology.

## Working scope

Work item D from the epic. Assumes a running Dokploy instance (host provisioning is guide
territory, not IaC code). May split further if per-app IaC grows large.

## Assumptions going in

- Dokploy is (or will be) running on the Proxmox host; a build node exists on the same
  Proxmox (see topology decision).
- `test` branch → Dokploy test-env auto-deploy (branch model from slice --03).

## Decisions made during the slice

From the epic's spike (record as ADR here):

- **IaC via the official Dokploy API/CLI**, not a Terraform provider (no official provider;
  community ones fragmented/unverified). Community TF provider is an optional later layer.
- **Builds on the same Proxmox as Dokploy**; Dockerfile/Compose build types; no Nixpacks.
- **Recommended build topology: a dedicated build-server VM/LXC on the same Proxmox host**
  (Dokploy remote build over SSH) to isolate build load from the deploy VM — building on
  the Dokploy host directly is RAM/CPU-heavy and can freeze it.

## Deferred / pushed forward

- **Proxmox host + Dokploy install provisioning** — covered by the setup guide, not the
  app IaC.
- **Community Terraform provider** — evaluate as a nicer declarative layer only after the
  API/CLI IaC is proven.
- **Per-app runtime tuning + secrets management** — beyond the reproducible-target scope.

## Open questions

- **Build topology (final)** — dedicated build-server VM (recommended, isolated) vs build
  on the Dokploy VM (simplest). Both are "same Proxmox".
- **What deploys** — which apps become Dokploy apps (`api`, current clients?); the AAA
  stubs are dev-only and do NOT deploy.
- **Secrets** — how env/secrets reach Dokploy (API-set vs Dokploy UI vs a secrets store);
  not committed in plaintext.
- **IaC format** — declarative config file(s) the apply script reads (JSON/YAML) vs
  imperative CLI script; prefer a declarative source of truth.

## Learnings

- ...

## Retrospective

(Fill in at wrap-up.)
