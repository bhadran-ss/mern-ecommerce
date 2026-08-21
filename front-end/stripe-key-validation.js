export const validateStripePublishableKey = (
  key,
  { allowMissing = false } = {},
) => {
  const normalized = key?.trim() || "";
  if (!normalized && allowMissing) return "";
  if (normalized.startsWith("pk_live_") || normalized.startsWith("sk_live_")) {
    throw new Error("Live Stripe keys are not allowed in this demonstration.");
  }
  if (!normalized.startsWith("pk_test_")) {
    throw new Error("A Stripe test publishable key is required.");
  }
  return normalized;
};
