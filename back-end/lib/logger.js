const sensitiveFieldPattern =
  /authorization|cookie|token|password|secret|api[_-]?key|signature|session|payment/i;
const stripeKeyPattern = /\b(?:pk|sk)_(?:test|live)_[A-Za-z0-9_]+\b/g;
const bearerPattern = /\bBearer\s+[^\s,;]+/gi;
const urlCredentialsPattern = /(https?:\/\/)[^/@\s]+:[^/@\s]+@/gi;

const redact = (value, fieldName = "") => {
  if (sensitiveFieldPattern.test(fieldName)) {
    return "[REDACTED]";
  }

  if (typeof value === "string") {
    return value
      .replace(stripeKeyPattern, "[REDACTED]")
      .replace(bearerPattern, "Bearer [REDACTED]")
      .replace(urlCredentialsPattern, "$1[REDACTED]@");
  }

  if (Array.isArray(value)) {
    return value.map((item) => redact(item));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, redact(item, key)]),
    );
  }

  return value;
};

const write = (level, event, fields = {}) => {
  const entry = redact({
    timestamp: new Date().toISOString(),
    level,
    event,
    ...fields,
  });
  const output = JSON.stringify(entry);

  if (level === "error") {
    console.error(output);
  } else {
    console.log(output);
  }
};

const logger = Object.freeze({
  info: (event, fields) => write("info", event, fields),
  warn: (event, fields) => write("warn", event, fields),
  error: (event, fields) => write("error", event, fields),
});

export { logger, redact };
