const SENSITIVE_KEY_PATTERN =
  /(authorization|cookie|email|password|token|secret|api[-_]?key|mongo.*uri|redis.*url)/i;
const STRIPE_KEY_PATTERN = /\b[sp]k_(?:live|test)_[A-Za-z0-9_]+\b/g;
const BEARER_PATTERN = /Bearer\s+[^\s,]+/gi;
const CREDENTIAL_URL_PATTERN = /(\w+(?:\+srv)?:\/\/)[^\s:@/]+:[^\s@/]+@/g;

const redactString = (value) =>
  value
    .replace(STRIPE_KEY_PATTERN, "[REDACTED_STRIPE_KEY]")
    .replace(BEARER_PATTERN, "Bearer [REDACTED]")
    .replace(CREDENTIAL_URL_PATTERN, "$1[REDACTED]@");

export const redactSensitive = (value, seen = new WeakSet()) => {
  if (typeof value === "string") {
    return redactString(value);
  }

  if (value instanceof Error) {
    return {
      name: value.name,
      message: redactString(value.message),
      stack: value.stack ? redactString(value.stack) : undefined,
    };
  }

  if (Array.isArray(value)) {
    return value.map((item) => redactSensitive(item, seen));
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  if (seen.has(value)) {
    return "[CIRCULAR]";
  }
  seen.add(value);

  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key,
      SENSITIVE_KEY_PATTERN.test(key)
        ? "[REDACTED]"
        : redactSensitive(item, seen),
    ]),
  );
};

export const createLogger = ({ write } = {}) => {
  const emit = (level, message, context = {}) => {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...redactSensitive(context),
    };
    const line = JSON.stringify(entry);

    if (write) {
      write(line, entry);
    } else if (level === "error") {
      console.error(line);
    } else if (level === "warn") {
      console.warn(line);
    } else {
      console.log(line);
    }
  };

  return {
    debug: (message, context) => emit("debug", message, context),
    info: (message, context) => emit("info", message, context),
    warn: (message, context) => emit("warn", message, context),
    error: (message, context) => emit("error", message, context),
  };
};

export const logger = createLogger();
