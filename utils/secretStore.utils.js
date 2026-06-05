import { getOrNull, buildKey, hashValue, setWithTTL, deleteKey } from "./redis.utils.js";

export class SecretStore {
  constructor({ prefix, ttl, hash = false }) {
    this.prefix = prefix;
    this.ttl = ttl;
    this.hash = hash;
  }

  key(id) {
    return buildKey(this.prefix, id);
  }

  transform(value) {
    return this.hash ? hashValue(value) : String(value);
  }

  async set(id, value, ttl = this.ttl) {
    return setWithTTL(this.key(id), this.transform(value), ttl);
  }

  async get(id) {
    return getOrNull(this.key(id));
  }

  async verify(id, value) {
    const stored = await this.get(id);
    if (!stored) return false;
    return stored === this.transform(value);
  }

  async delete(id) {
    return deleteKey(this.key(id));
  }
}