import { incrementWithTTL,buildKey,getOrNull,deleteKey } from "./redis.utils.js";

export class CounterStore {
  constructor({ prefix, ttl }) {
    this.prefix = prefix;
    this.ttl = ttl;
  }

  key(id, type = "count") {
    return buildKey(this.prefix, type, id);
  }

  async incr(id, ttl = this.ttl) {
    return incrementWithTTL(this.key(id), ttl);
  }

  async get(id) {
    const val = await getOrNull(this.key(id));
    return parseInt(val || "0");
  }

  async reset(id) {
    return deleteKey(this.key(id));
  }
}