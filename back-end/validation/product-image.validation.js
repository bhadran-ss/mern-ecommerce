import { ApiError } from "../middleware/errors.js";

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const MAX_TOTAL_IMAGE_BYTES = 6 * 1024 * 1024;
const MAX_IMAGE_COUNT = 4;
const imageSignatures = {
  "image/jpeg": (buffer) =>
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff,
  "image/png": (buffer) =>
    buffer.length >= 8 &&
    buffer
      .subarray(0, 8)
      .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])),
  "image/webp": (buffer) =>
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP",
};

export const getProductImageInputs = (body) => {
  if (Array.isArray(body.images) && body.images.length > 0) {
    return { dataUrls: body.images, field: "images" };
  }
  if (typeof body.image === "string" && body.image) {
    return { dataUrls: [body.image], field: "image" };
  }
  return { dataUrls: [], field: null };
};

export const validateProductImageDataUrls = (dataUrls) => {
  if (dataUrls.length > MAX_IMAGE_COUNT) {
    throw new ApiError(
      400,
      "IMAGE_LIMIT_EXCEEDED",
      "A product can have at most four images.",
    );
  }

  let totalBytes = 0;
  for (const dataUrl of dataUrls) {
    const match =
      /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]+={0,2})$/.exec(
        dataUrl,
      );
    if (!match || match[2].length % 4 !== 0) {
      throw new ApiError(
        400,
        "INVALID_IMAGE",
        "Images must be JPEG, PNG, or WebP files.",
      );
    }

    const buffer = Buffer.from(match[2], "base64");
    if (buffer.length === 0 || buffer.toString("base64") !== match[2]) {
      throw new ApiError(400, "INVALID_IMAGE", "Image data is invalid.");
    }
    if (buffer.length > MAX_IMAGE_BYTES) {
      throw new ApiError(
        413,
        "IMAGE_TOO_LARGE",
        "Each image must be 2 MB or smaller.",
      );
    }

    totalBytes += buffer.length;
    if (totalBytes > MAX_TOTAL_IMAGE_BYTES) {
      throw new ApiError(
        413,
        "IMAGE_TOTAL_TOO_LARGE",
        "Combined image size must be 6 MB or smaller.",
      );
    }

    if (!imageSignatures[match[1]](buffer)) {
      throw new ApiError(
        400,
        "INVALID_IMAGE",
        "Image content does not match its declared type.",
      );
    }
  }
};
