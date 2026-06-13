import {
  setValue,
  getOrNull,
  addToSet,
  removeFromSet,
  getSetMembers,
  isSetMember,
  buildKey,
  deleteKey
} from "../../utils/redis.utils.js";

class RoomStore {

  // -----------------------------
  // KEYS
  // -----------------------------
  typeKey(roomId) {
    return buildKey("room", roomId, "type");
  }

  membersKey(roomId) {
    return buildKey("room", roomId, "members");
  }

  // -----------------------------
  // TYPE
  // -----------------------------
  async setType(roomId, type) {
    return setValue({
      key: this.typeKey(roomId),
      value: type
    });
  }

  async getType(roomId) {
    return getOrNull(this.typeKey(roomId));
  }

  // -----------------------------
  // MEMBERS
  // -----------------------------
  async addMember(roomId, userId) {
    return addToSet(this.membersKey(roomId), userId);
  }

  async removeMember(roomId, userId) {
    return removeFromSet(this.membersKey(roomId), userId);
  }

  async getMembers(roomId) {
    return getSetMembers(this.membersKey(roomId));
  }

  async isMember(roomId, userId) {
    return isSetMember(this.membersKey(roomId), userId);
  }

  // -----------------------------
  // LIFECYCLE
  // -----------------------------
  async create({ roomId, type, members = [] }) {
    await this.setType(roomId, type);

    // parallelize safely
    await Promise.all(
      members.map(userId =>
        this.addMember(roomId, userId)
      )
    );

    return true;
  }

  async delete(roomId) {
    await deleteKey(this.typeKey(roomId));
    await deleteKey(this.membersKey(roomId));
    return true;
  }
}

export const roomStore = new RoomStore();

export const getUserRoom = (id) => `user:${id}`;