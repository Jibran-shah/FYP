import { SecretStore } from "./secretStore.utils.js";
import {
  buildKey,
  setWithTTL,
  getOrNull,
  deleteKey,
} from "./redis.utils.js";

export class CooldownSecretStore extends SecretStore {
  constructor({
    prefix,
    ttl,
    hash = false,
    cooldownTTL,
    cooldownPrefix = null,
  }) {
    super({
      prefix,
      ttl,
      hash,
    });

    if (!cooldownTTL) {
      throw new Error("cooldownTTL is required");
    }

    this.cooldownTTL = cooldownTTL;
    this.cooldownPrefix = cooldownPrefix || `${prefix}:cooldown`;
  }

  cooldownKey(id) {
    return buildKey(this.cooldownPrefix, id);
  }

  async startCooldown(id, ttl = this.cooldownTTL) {
    return setWithTTL(this.cooldownKey(id), "1", ttl);
  }

  async hasCooldown(id) {
    const value = await getOrNull(this.cooldownKey(id));
    return !!value;
  }

  async clearCooldown(id) {
    return deleteKey(this.cooldownKey(id));
  }

  async set(id, value, ttl = this.ttl) {
    const result = await super.set(id, value, ttl);
    await this.startCooldown(id);
    return result;
  }

  async canRequest(id) {
    return !(await this.hasCooldown(id));
  }
}