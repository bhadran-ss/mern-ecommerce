import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const frontendRoot = fileURLToPath(new URL("../", import.meta.url));
const packageJson = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8"),
);
const packageLock = JSON.parse(
  readFileSync(new URL("../package-lock.json", import.meta.url), "utf8"),
);
const sourceRoot = path.join(frontendRoot, "src");

const collectSourceFiles = (directory) =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return collectSourceFiles(entryPath);
    }

    return entry.isFile() && /\.(?:js|jsx)$/.test(entry.name) ? [entryPath] : [];
  });

test("frontend has no recursive root package dependency", () => {
  assert.equal(packageJson.dependencies?.["e-commerce-web"], undefined);
  assert.equal(packageJson.devDependencies?.["e-commerce-web"], undefined);
  assert.equal(packageLock.packages[""].dependencies?.["e-commerce-web"], undefined);
  assert.equal(packageLock.packages["node_modules/e-commerce-web"], undefined);
});

test("Zustand and its retired stores remain removed", () => {
  assert.equal(packageJson.dependencies?.zustand, undefined);
  assert.equal(packageJson.devDependencies?.zustand, undefined);
  assert.equal(packageLock.packages[""].dependencies?.zustand, undefined);
  assert.equal(packageLock.packages["node_modules/zustand"], undefined);

  const retiredStores = ["useCartStore.js", "useProductStore.js", "useUserStore.js"];
  for (const store of retiredStores) {
    assert.equal(existsSync(path.join(sourceRoot, "stores", store)), false, `${store} still exists`);
  }

  for (const file of collectSourceFiles(sourceRoot)) {
    assert.doesNotMatch(readFileSync(file, "utf8"), /(?:from\s+["']zustand["']|require\(["']zustand["']\))/);
  }
});

test("frontend production build never installs dependencies", () => {
  assert.equal(typeof packageJson.scripts?.build, "string");
  assert.doesNotMatch(
    packageJson.scripts.build,
    /(?:^|[;&|]\s*)npm(?:\.cmd)?\s+(?:i|install|ci|add)(?:\s|$)/i,
  );
});
