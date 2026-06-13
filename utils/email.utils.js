import { BASE_ROOT } from "../constants/app.constants.js";
import { AUTH_CONFIG } from "../config/auth.config.js";
import { CooldownSecretStore } from "./coolDownStore.utils.js";


export const emailVerificationStore = new CooldownSecretStore(
  {
    prefix: "email:verify",
    ttl: AUTH_CONFIG.EMAIL_VERIFY.TTL_SECONDS,
    cooldownTTL:AUTH_CONFIG.EMAIL_VERIFY.COOLDOWN_SECONDS,
    cooldownPrefix:"cooldown",
    hash: true,
  }
)

export const generateVerificationLink =
  (userId, token) => {
    return `/verify-email?userId=${userId}&token=${token}`;
  };

