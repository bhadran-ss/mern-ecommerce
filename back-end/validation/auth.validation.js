const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const containsControlCharacter = (value) =>
  [...value].some((character) => {
    const codePoint = character.codePointAt(0);
    return codePoint <= 31 || codePoint === 127;
  });

export const normalizeEmail = (email) =>
  typeof email === "string" ? email.trim().toLowerCase() : "";

const validateEmail = (email, issues) => {
  if (!email) {
    issues.email = "Email is required";
  } else if (email.length > 254 || !emailPattern.test(email)) {
    issues.email = "Email must be a valid address";
  }
};

export const getPasswordValidationIssue = (password) => {
  if (typeof password !== "string" || password.length === 0) {
    return "Password is required";
  }

  if (password.length < 12) {
    return "Password must contain at least 12 characters";
  }

  if (Buffer.byteLength(password, "utf8") > 72) {
    return "Password must not exceed 72 UTF-8 bytes";
  }

  if (
    !/[a-z]/.test(password) ||
    !/[A-Z]/.test(password) ||
    !/[0-9]/.test(password) ||
    !/[^A-Za-z0-9]/.test(password)
  ) {
    return "Password must include uppercase, lowercase, number, and symbol characters";
  }

  return null;
};

export const validateRegistrationInput = (input) => {
  const source = input && typeof input === "object" ? input : {};
  const issues = {};
  const name = typeof source.name === "string" ? source.name.trim() : "";
  const email = normalizeEmail(source.email);

  if (!name) {
    issues.name = "Name is required";
  } else if (
    name.length < 2 ||
    name.length > 80 ||
    containsControlCharacter(name)
  ) {
    issues.name = "Name must contain between 2 and 80 valid characters";
  }

  validateEmail(email, issues);
  const passwordIssue = getPasswordValidationIssue(source.password);
  if (passwordIssue) {
    issues.password = passwordIssue;
  }

  if (source.role !== undefined && source.role !== "customer") {
    issues.role = "Public registration creates customer accounts only";
  }

  return {
    value: {
      name,
      email,
      password: typeof source.password === "string" ? source.password : "",
    },
    issues,
  };
};

export const validateLoginInput = (input) => {
  const source = input && typeof input === "object" ? input : {};
  const issues = {};
  const email = normalizeEmail(source.email);
  const password =
    typeof source.password === "string" ? source.password : "";

  validateEmail(email, issues);
  if (!password) {
    issues.password = "Password is required";
  } else if (Buffer.byteLength(password, "utf8") > 72) {
    issues.password = "Password must not exceed 72 UTF-8 bytes";
  }

  return { value: { email, password }, issues };
};

export const hasValidationIssues = (issues) =>
  Object.keys(issues).length > 0;
