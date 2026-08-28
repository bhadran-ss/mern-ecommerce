import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const packageJson = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8"),
);

const requiredScripts = [
  "dev",
  "dev:server",
  "dev:client",
  "start",
  "lint",
  "lint:server",
  "lint:client",
  "test",
  "test:server",
  "test:client",
  "build",
  "build:server",
  "build:client",
  "seed",
];

test("root package exposes every required project script", () => {
  for (const script of requiredScripts) {
    assert.equal(typeof packageJson.scripts[script], "string", `${script} is missing`);
    assert.notEqual(packageJson.scripts[script].trim(), "", `${script} is empty`);
  }
});

test("build scripts never execute dependency installation", () => {
  const installCommand = /(?:^|[;&|]\s*)npm(?:\.cmd)?\s+(?:i|install|ci|add)(?:\s|$)/i;
  const buildScripts = Object.entries(packageJson.scripts).filter(([name]) =>
    name.startsWith("build"),
  );

  assert.ok(buildScripts.length > 0, "no build scripts were found");

  for (const [name, command] of buildScripts) {
    assert.doesNotMatch(command, installCommand, `${name} runs installation`);
  }
});
