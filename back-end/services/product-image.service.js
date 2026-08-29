import cloudinary from "../config/cloudinary.js";

const getCloudinaryPublicId = (imageUrl) => {
  try {
    const parsedUrl = new URL(imageUrl);
    const cloudName = cloudinary.config().cloud_name;
    const segments = decodeURIComponent(parsedUrl.pathname)
      .split("/")
      .filter(Boolean);

    if (
      parsedUrl.hostname !== "res.cloudinary.com" ||
      segments[0] !== cloudName ||
      segments[1] !== "image" ||
      segments[2] !== "upload"
    ) {
      return null;
    }

    const publicIdSegments = segments.slice(3);
    if (/^v\d+$/.test(publicIdSegments[0] || "")) {
      publicIdSegments.shift();
    }
    if (publicIdSegments[0] !== "products" || publicIdSegments.length < 2) {
      return null;
    }

    const lastSegment = publicIdSegments.at(-1).replace(/\.[^.]+$/, "");
    publicIdSegments[publicIdSegments.length - 1] = lastSegment;
    return publicIdSegments.join("/");
  } catch {
    return null;
  }
};

export const getProductImageReferences = (product) =>
  [...new Set([product.image, ...(product.images || [])].filter(Boolean))];

export const cleanupProductImages = async (imageReferences, logger) => {
  const publicIds = new Set();
  for (const image of imageReferences) {
    const publicId =
      typeof image === "string"
        ? getCloudinaryPublicId(image)
        : image?.public_id || getCloudinaryPublicId(image?.secure_url);
    if (publicId) publicIds.add(publicId);
  }

  await Promise.all(
    [...publicIds].map(async (publicId) => {
      try {
        const result = await cloudinary.uploader.destroy(publicId, {
          resource_type: "image",
        });
        if (!result || !["ok", "not found"].includes(result.result)) {
          logger?.warn("product.image.cleanup_failed", {
            resourceType: "image",
          });
        }
      } catch {
        logger?.warn("product.image.cleanup_failed", {
          resourceType: "image",
        });
      }
    }),
  );
};

export const uploadProductImages = async (dataUrls, logger) => {
  const uploadedImages = [];
  try {
    for (const dataUrl of dataUrls) {
      const image = await cloudinary.uploader.upload(dataUrl, {
        folder: "products",
        resource_type: "image",
      });
      uploadedImages.push(image);
    }
    return uploadedImages;
  } catch (error) {
    await cleanupProductImages(uploadedImages, logger);
    throw error;
  }
};
