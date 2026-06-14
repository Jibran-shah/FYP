import { MODELS } from "./models.constants.js";

export const REVIEW_ENTITYS = Object.freeze({
    PRODUCT:MODELS.PRODUCT,
    SELLER:MODELS.PRODUCT_SELLER,
    PROVIDER:MODELS.SERVICE_PROVIDER,
    SERVICE:MODELS.SERVICE
});

export const REVIEW_ENTITYS_ARRAY = Object.freeze(Object.values(REVIEW_ENTITYS));