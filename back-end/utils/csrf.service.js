import {
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

import { getConfig } from "../config/env.js";

const config = getConfig();

export const createCsrfTokenService = ({
  secret = config.jwe.accessSecret,
} = {}) => {
  const signingKey = createHash("sha256").update(`csrf-key:${secret}`).digest();
  console.log("signingKey", signingKey.toString("base64url"));
  const sign = (value) =>
    createHmac("sha256", signingKey).update(value).digest();
  console.log("sign", sign.toString("base64url"));
  return Object.freeze({
    createToken: () => {
      const value = randomBytes(32).toString("base64url");
      return `${value}.${sign(value).toString("base64url")}`;
    },
    verifyToken: (token) => {
      if (typeof token !== "string") {
        return false;
      }

      const separator = token.lastIndexOf(".");
      if (separator <= 0) {
        return false;
      }

      console.log("token", token);

      const value = token.slice(0, separator);
      const providedSignature = Buffer.from(
        token.slice(separator + 1),
        "base64url",
      );
      const expectedSignature = sign(value);

      return (
        providedSignature.length === expectedSignature.length &&
        timingSafeEqual(providedSignature, expectedSignature)
      );
    },
  });
};

export const csrfTokenService = createCsrfTokenService();
