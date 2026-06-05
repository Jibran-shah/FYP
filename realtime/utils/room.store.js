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

import {DirectChat} from "../../models/DirectChat.model.js"
import {GroupChat} from "../../models/GroupChat.model.js"

class RoomStore {
  /*
  =====================================================
  KEYS
  =====================================================
  */

  typeKey(roomId) {
    return buildKey("room", roomId, "type");
  }

  membersKey(roomId) {
    return buildKey("room", roomId, "members");
  }

  /*
  =====================================================
  ROOM TYPE
  =====================================================
  */

  async setType(roomId, type) {
    return setValue({
      key: this.typeKey(roomId),
      value: type
    });
  }

  async getType(roomId) {
    return getOrNull(this.typeKey(roomId));
  }

  /*
  =====================================================
  ROOM MEMBERS
  =====================================================
  */

  async addMember(roomId, userId) {
    return addToSet(
      this.membersKey(roomId),
      userId
    );
  }

  async removeMember(roomId, userId) {
    return removeFromSet(
      this.membersKey(roomId),
      userId
    );
  }

  async getMembers(roomId) {
    return getSetMembers(
      this.membersKey(roomId)
    );
  }

  async isMember(roomId, userId) {
    return isSetMember(
      this.membersKey(roomId),
      userId
    );
  }

  /*
  =====================================================
  ROOM LIFECYCLE
  =====================================================
  */

  async create({
    roomId,
    type,
    members = []
  }) {
    
    await this.setType(roomId, type);

    for (const userId of members) {
      await this.addMember(roomId, userId);
    }

    return true;
  }

  async delete(roomId) {
    await deleteKey(this.typeKey(roomId));
    await deleteKey(this.membersKey(roomId));

    return true;
  }


  async validateAccess(roomId, userId, typeModel) {

    const existsInRedis = await this.getType(roomId);

    if (existsInRedis) {
      return this.isMember(roomId, userId);
    }

    let room;

    if (typeModel === "DIRECT_CHAT") {
      room = await DirectChat.findById(roomId).lean();
    } else if (typeModel === "GROUP_CHAT") {
      room = await GroupChat.findById(roomId).lean();
    }

    if (!room) return false;

    await this.create({
      roomId,
      type: typeModel,
      members: room.members || room.participants || []
    });

    return this.isMember(roomId, userId);
  }
}

export const roomStore = new RoomStore();

export const getUserRoom = (id)=>`user:${id}`;