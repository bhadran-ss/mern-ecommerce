const redactedValue = "[REDACTED]";
const sensitiveKeyPattern =
  /authorization|cookie|password|token|secret|api[-_]?key|stripe|credential/i;
const sensitiveValuePatterns = [
  {
    pattern: /\b(?:sk|pk)_(?:test|live)_[A-Za-z0-9_]+\b/g,
    replacement: redactedValue,
  },
  { pattern: /\bwhsec_[A-Za-z0-9_]+\b/g, replacement: redactedValue },
  { pattern: /\bBearer\s+[^\s"]+/gi, replacement: redactedValue },
  {
    pattern:
      /\b(https?|mongodb(?:\+srv)?|rediss?):\/\/[^\s/@:]+:[^\s/@]+@/gi,
    replacement: `$1://${redactedValue}@`,
  },
];

const redactText = (value) =>
  sensitiveValuePatterns.reduce(
    (result, { pattern, replacement }) => result.replace(pattern, replacement),
    value,
  );

const redact = (value, key = "", seen = new WeakSet()) => {
  if (sensitiveKeyPattern.test(key)) {
    return redactedValue;
  }

  if (typeof value === "string") {
    return redactText(value);
  }

  if (value instanceof Error) {
    return {
      name: value.name,
      message: redactText(value.message),
    };
  }

  if (Array.isArray(value)) {
    return value.map((item) => redact(item, "", seen));
  }

  if (value && typeof value === "object") {
    if (seen.has(value)) {
      return "[CIRCULAR]";
    }

    seen.add(value);
    const result = Object.fromEntries(
      Object.entries(value).map(([entryKey, entryValue]) => [
        entryKey,
        redact(entryValue, entryKey, seen),
      ]),
    );
    seen.delete(value);
    return result;
  }

  return value;
};

export const createLogger = ({ sink } = {}) => {
  const write =
    sink ??
    ((entry) => {
      const line = JSON.stringify(entry);
      if (entry.level === "error") {
        console.error(line);
      } else {
        console.log(line);
      }
    });

  const emit = (level, event, details = {}) => {
    write(
      redact({
        timestamp: new Date().toISOString(),
        level,
        event,
        ...details,
      }),
    );
  };

  return Object.freeze({
    debug: (event, details) => emit("debug", event, details),
    info: (event, details) => emit("info", event, details),
    warn: (event, details) => emit("warn", event, details),
    error: (event, details) => emit("error", event, details),
  });
};

export const logger = createLogger();
