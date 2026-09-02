const collapseWhitespace = (value) =>
  typeof value === "string" ? value.trim().replace(/\s+/g, " ") : value;

export const normalizeCatalogueText = (value) => collapseWhitespace(value);

export const normalizeCategoryName = (value) => {
  const normalized = collapseWhitespace(value);
  if (!normalized) {
    return normalized;
  }

  return normalized
    .toLocaleLowerCase("en-US")
    .split(" ")
    .map((word) => `${word.charAt(0).toLocaleUpperCase("en-US")}${word.slice(1)}`)
    .join(" ");
};

export const normalizeSlug = (value) => {
  const normalized = collapseWhitespace(value);
  if (!normalized) {
    return normalized;
  }

  return normalized
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("en-US")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export const normalizeSku = (value) => {
  const normalized = collapseWhitespace(value);
  return normalized
    ? normalized.toLocaleUpperCase("en-US").replace(/\s+/g, "-")
    : normalized;
};

export const normalizeTags = (values) => {
  if (!Array.isArray(values)) {
    return values;
  }

  return [
    ...new Set(
      values
        .map((value) => collapseWhitespace(value)?.toLocaleLowerCase("en-US"))
        .filter(Boolean),
    ),
  ];
};
