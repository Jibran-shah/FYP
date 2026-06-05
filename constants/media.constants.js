
export const MEMORY_SIZES = Object.freeze({
  ONE_MB:1024*1024,
  ONE_GB:1024*1024*1024
})


export const MEDIA_USAGE_TYPES = Object.freeze({
  // =====================
  // CORE GENERIC TYPES
  // =====================
  THUMBNAIL: "thumbnail",
  BANNER: "banner",
  GALLERY: "gallery",
  AVATAR: "avatar",
  DOCUMENT: "document",
  OTHER: "other",

  // =====================
  // PROFILE (USER)
  // =====================
  PROFILE_AVATAR: "profileAvatar",
  PROFILE_COVER: "profileCover",

  // =====================
  // SELLER / SHOP
  // =====================
  SHOP_LOGO: "shopLogo",
  SHOP_BANNER: "shopBanner",
  SHOP_GALLERY: "shopGallery",
  SHOP_DOCUMENT: "shopDocument",

  // =====================
  // PRODUCT
  // =====================
  PRODUCT_IMAGE: "productImage",
  PRODUCT_THUMBNAIL: "productThumbnail",
  PRODUCT_GALLERY: "productGallery",
  PRODUCT_VIDEO: "productVideo",

  // =====================
  // CATEGORY
  // =====================
  CATEGORY_IMAGE: "categoryImage",

  // =====================
  // BANNERS / MARKETING
  // =====================
  PROMO_BANNER: "promoBanner",
  AD_BANNER: "adBanner",

  // =====================
  // CHAT / MESSAGING
  // =====================
  CHAT_IMAGE: "chatImage",
  CHAT_VIDEO: "chatVideo",
  CHAT_DOCUMENT: "chatDocument",

  // =====================
  // REVIEWS
  // =====================
  REVIEW_IMAGE: "reviewImage",
  REVIEW_VIDEO: "reviewVideo",

  // =====================
  // VERIFICATION / LEGAL
  // =====================
  VERIFICATION_DOCUMENT: "verificationDocument"
});

export const MEDIA_USAGE_TYPES_ARRAY = Object.freeze(Object.values(MEDIA_USAGE_TYPES));;


export const DEFAULTS = Object.freeze({
    title: "untitled",
    namespaceParts:"default",
    usageType:MEDIA_USAGE_TYPES.OTHER
})

export const NAMESPACES = Object.freeze({
  // =====================
  // USER BASE PROFILE
  // =====================
  PROFILE_AVATAR: "user/baseProfile/avatar",
  PROFILE_COVER: "user/baseProfile/cover",

  // =====================
  // SELLER PROFILE
  // =====================
  SELLER_LOGO: "user/seller/logo",
  SELLER_BANNER: "user/seller/banner",
  SELLER_GALLERY: "user/seller/gallery",
  SELLER_DOCUMENTS: "user/seller/documents",

  // =====================
  // PRODUCT
  // =====================
  PRODUCT_IMAGES: "product/images",
  PRODUCT_GALLERY: "product/gallery",
  PRODUCT_VIDEOS: "product/videos",

  // =====================
  // CATEGORY
  // =====================
  CATEGORY_IMAGES: "category/images",

  // =====================
  // MARKETING / ADS
  // =====================
  BANNERS: "marketing/banners",
  ADS: "marketing/ads",

  // =====================
  // CHAT
  // =====================
  CHAT_MEDIA: "chat/media",

  // =====================
  // REVIEWS
  // =====================
  REVIEW_MEDIA: "review/media",

  // =====================
  // DOCUMENTS
  // =====================
  VERIFICATION_DOCS: "verification/docs"
});

export const FILE_MAX_SIZES = Object.freeze({
  PROFILE_AVATAR: 5 * MEMORY_SIZES.ONE_MB,
  PROFILE_COVER: 10 * MEMORY_SIZES.ONE_MB,

  PRODUCT_IMAGE: 10 * MEMORY_SIZES.ONE_MB,
  PRODUCT_VIDEO: 100 * MEMORY_SIZES.ONE_MB,

  SERVICE_IMAGE: 10 * MEMORY_SIZES.ONE_MB,
  SERVICE_VIDEO: 100 * MEMORY_SIZES.ONE_MB,

  CHAT_IMAGE: 15 * MEMORY_SIZES.ONE_MB,
  CHAT_VIDEO: 50 * MEMORY_SIZES.ONE_MB,
  CHAT_DOCUMENT: 20 * MEMORY_SIZES.ONE_MB,

  VERIFICATION_DOCUMENT: 15 * MEMORY_SIZES.ONE_MB,

  CATEGORY_IMAGE: 5 * MEMORY_SIZES.ONE_MB,
  BANNER_IMAGE: 10 * MEMORY_SIZES.ONE_MB,

  REVIEW_IMAGE: 8 * MEMORY_SIZES.ONE_MB,
  REVIEW_VIDEO: 50 * MEMORY_SIZES.ONE_MB,
})

export const MAX_SIZE_CAP = 200 * MEMORY_SIZES.ONE_MB;

export const MEDIA_PROVIDERS = Object.freeze({
  LOCAL:"local",
  AWS_S3:"aws-s3",
  CLOUDINARY:"cloudinary"
});

export const MEDIA_PROVIDERS_ARRAY =Object.freeze(Object.values(MEDIA_PROVIDERS));