import assert from "node:assert/strict";
import test from "node:test";

import { createLogger } from "../back-end/utils/logger.js";

test("structured logger redacts credentials and sensitive fields", () => {
  let loggedEntry;
  const logger = createLogger({
    write: (_line, entry) => {
      loggedEntry = entry;
    },
  });

  logger.error("Example failure", {
    password: "not-for-logs",
    nested: { authorization: "Bearer private-token" },
    message: "Key sk_test_should_not_appear",
    database: "mongodb+srv://user:password@example.test/database",
  });

  const serialized = JSON.stringify(loggedEntry);
  assert.equal(loggedEntry.level, "error");
  assert.equal(loggedEntry.password, "[REDACTED]");
  assert.equal(loggedEntry.nested.authorization, "[REDACTED]");
  assert.doesNotMatch(serialized, /not-for-logs|private-token|should_not_appear|user:password/);
});
