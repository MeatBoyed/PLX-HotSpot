// Gate for the root dev-orchestration compose stack.
// Behaviour pinned: `docker compose config` resolves with zero env, the stack
// declares the expected backing services, and no two services publish the same
// host port (the central port map has no collisions).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const devDir = dirname(fileURLToPath(import.meta.url));

function composeConfig(profiles = []) {
  const profileArgs = profiles.flatMap((p) => ['--profile', p]);
  const out = execFileSync(
    'docker',
    ['compose', '-f', 'docker-compose.yml', ...profileArgs, 'config', '--format', 'json'],
    { cwd: devDir, encoding: 'utf8' },
  );
  return JSON.parse(out);
}

test('the default stack is core-only (postgres + api), no opt-in tools', () => {
  const services = Object.keys(composeConfig().services ?? {});
  for (const core of ['postgres', 'api']) {
    assert.ok(services.includes(core), `core service ${core} must be up by default`);
  }
  for (const optional of ['pgadmin', 'seq']) {
    assert.ok(!services.includes(optional), `${optional} must stay behind a profile`);
  }
});

test('the admin UIs come up under the `tools` profile', () => {
  const services = Object.keys(composeConfig(['tools']).services ?? {});
  for (const tool of ['pgadmin', 'seq']) {
    assert.ok(services.includes(tool), `${tool} must be enabled by --profile tools`);
  }
});

test('no two services publish the same host port (across all profiles)', () => {
  const cfg = composeConfig(['tools', 'aaa']);
  const seen = new Map(); // host port -> service
  for (const [name, svc] of Object.entries(cfg.services ?? {})) {
    for (const p of svc.ports ?? []) {
      const host = String(p.published ?? '');
      if (!host) continue;
      assert.ok(
        !seen.has(host),
        `host port ${host} bound by both ${seen.get(host)} and ${name}`,
      );
      seen.set(host, name);
    }
  }
});

test('postgres mounts the per-group init scripts', () => {
  const cfg = composeConfig();
  const mounts = (cfg.services?.postgres?.volumes ?? []).map((v) => v.target);
  assert.ok(
    mounts.includes('/docker-entrypoint-initdb.d'),
    `postgres must mount the init dir; got targets ${mounts.join(', ')}`,
  );
});

test('api runs from bind-mounted source under dotnet watch, not a built image', () => {
  const cfg = composeConfig();
  const api = cfg.services?.api;
  assert.ok(api, 'missing service: api');

  // No image build in dev — the SDK image runs the source directly, so a source
  // edit never triggers `docker build`.
  assert.ok(!api.build, 'api must not define a build (no image rebuild on edit)');
  assert.match(api.image ?? '', /dotnet\/sdk/, 'api must use the .NET SDK image');

  // Hot reload via `dotnet watch`.
  const command = Array.isArray(api.command) ? api.command.join(' ') : (api.command ?? '');
  assert.match(command, /dotnet watch/, 'api command must run `dotnet watch`');

  // Source bind mount → edits land in the container.
  const bind = (api.volumes ?? []).find((v) => v.target === '/src');
  assert.ok(bind && bind.type === 'bind', 'api must bind-mount the source at /src');

  // Polling watcher — inotify does not cross the bind mount reliably (WSL2/Docker).
  assert.equal(api.environment?.DOTNET_USE_POLLING_FILE_WATCHER, 'true');
});
