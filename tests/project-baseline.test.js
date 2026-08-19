import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readPackage = async (relativePath) =>
  JSON.parse(await readFile(new URL(relativePath, import.meta.url), "utf8"));

test("root exposes consistent project commands", async () => {
  const rootPackage = await readPackage("../package.json");

  for (const script of ["dev", "lint", "test", "build", "start"]) {
    assert.equal(typeof rootPackage.scripts[script], "string");
    assert.notEqual(rootPackage.scripts[script].trim(), "");
  }

  assert.doesNotMatch(rootPackage.scripts.build, /npm (?:i|install)\b/);
});

test("frontend does not recursively install the root package", async () => {
  const frontendPackage = await readPackage("../front-end/package.json");

  assert.equal(frontendPackage.dependencies?.["e-commerce-web"], undefined);
  assert.equal(frontendPackage.devDependencies?.["e-commerce-web"], undefined);
});

test("removed packages stay out of direct dependencies", async () => {
  const rootPackage = await readPackage("../package.json");
  const frontendPackage = await readPackage("../front-end/package.json");

  assert.equal(rootPackage.dependencies.jsonwebtoken, undefined);

  for (const dependency of ["framer-motion", "redux", "zustand"]) {
    assert.equal(frontendPackage.dependencies[dependency], undefined);
  }
});
