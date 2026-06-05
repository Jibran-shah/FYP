import { GroupChat } from "../models/GroupChat.model.js";
import { roomStore } from "../../../realtime/utils/room.store.js";

/*
=====================================================
CREATE GROUP
=====================================================
*/
export const createGroupService = async (creatorId, data) => {
  const { name, description = "", members = [] } = data;

  const uniqueMembers = Array.from(
    new Set([creatorId.toString(), ...members.map(String)])
  );

  const group = await GroupChat.create({
    name,
    description,
    createdBy: creatorId,
    members: uniqueMembers.map(userId => ({
      userId,
      role: userId === creatorId.toString() ? "admin" : "member",
      isActive: true
    }))
  });

  // 🔥 REDIS SYNC (new RoomStore)
  await roomStore.create({
    roomId: group._id.toString(),
    type: "GROUP_CHAT",
    members: uniqueMembers
  });

  return group;
};

/*
=====================================================
GET USER GROUPS
=====================================================
*/
export const getUserGroupsService = async (userId) => {
  return await GroupChat.find({
    "members.userId": userId,
    isDeleted: false
  })
    .select("name description lastMessage createdAt")
    .sort({ updatedAt: -1 })
    .lean();
};

/*
=====================================================
GET SINGLE GROUP
=====================================================
*/
export const getGroupByIdService = async (userId, groupId) => {
  const group = await GroupChat.findById(groupId).lean();

  if (!group) throw new Error("Group not found");

  const isMember = group.members.some(
    m => m.userId.toString() === userId.toString() && m.isActive
  );

  if (!isMember) throw new Error("Not a member of this group");

  return group;
};

/*
=====================================================
ADD MEMBERS
=====================================================
*/
export const addMembersService = async (userId, groupId, members) => {
  const group = await GroupChat.findById(groupId);

  if (!group) throw new Error("Group not found");

  const isAdmin = group.members.some(
    m =>
      m.userId.toString() === userId.toString() &&
      m.role === "admin" &&
      m.isActive
  );

  if (!isAdmin) throw new Error("Not authorized");

  const newMembers = members.map(String);

  for (const memberId of newMembers) {
    const exists = group.members.find(
      m => m.userId.toString() === memberId
    );

    if (!exists) {
      group.members.push({
        userId: memberId,
        role: "member",
        isActive: true
      });

      // 🔥 Redis sync
      await roomStore.addMember(groupId, memberId);
    } else {
      exists.isActive = true;

      // 🔥 ensure Redis consistency
      await roomStore.addMember(groupId, memberId);
    }
  }

  await group.save();

  return group;
};

/*
=====================================================
REMOVE MEMBER
=====================================================
*/
export const removeMemberService = async (userId, groupId, memberId) => {
  const group = await GroupChat.findById(groupId);

  if (!group) throw new Error("Group not found");

  const isAdmin = group.members.some(
    m =>
      m.userId.toString() === userId.toString() &&
      m.role === "admin" &&
      m.isActive
  );

  if (!isAdmin) throw new Error("Not authorized");

  const member = group.members.find(
    m => m.userId.toString() === memberId.toString()
  );

  if (!member) throw new Error("Member not found");

  member.isActive = false;

  await roomStore.removeMember(groupId, memberId);

  await group.save();

  return group;
};

/*
=====================================================
LEAVE GROUP
=====================================================
*/
export const leaveGroupService = async (userId, groupId) => {
  const group = await GroupChat.findById(groupId);

  if (!group) throw new Error("Group not found");

  const member = group.members.find(
    m => m.userId.toString() === userId.toString()
  );

  if (!member) throw new Error("Not a member");

  member.isActive = false;

  await roomStore.removeMember(groupId, userId);

  await group.save();

  return { success: true };
};

/*
=====================================================
UPDATE GROUP
=====================================================
*/
export const updateGroupService = async (userId, groupId, updates) => {
  const group = await GroupChat.findById(groupId);

  if (!group) throw new Error("Group not found");

  const isAdmin = group.members.some(
    m =>
      m.userId.toString() === userId.toString() &&
      m.role === "admin" &&
      m.isActive
  );

  if (!isAdmin) throw new Error("Not authorized");

  const allowedFields = ["name", "description", "settings"];

  for (const key of allowedFields) {
    if (updates[key] !== undefined) {
      group[key] = updates[key];
    }
  }

  await group.save();

  return group;
};

/*
=====================================================
CHANGE ROLE
=====================================================
*/
export const changeRoleService = async (
  userId,
  groupId,
  memberId,
  role
) => {
  const group = await GroupChat.findById(groupId);

  if (!group) throw new Error("Group not found");

  const isAdmin = group.members.some(
    m =>
      m.userId.toString() === userId.toString() &&
      m.role === "admin" &&
      m.isActive
  );

  if (!isAdmin) throw new Error("Not authorized");

  const member = group.members.find(
    m => m.userId.toString() === memberId.toString()
  );

  if (!member) throw new Error("Member not found");

  member.role = role;

  await group.save();

  return group;
};

/*
=====================================================
DELETE GROUP
=====================================================
*/
export const deleteGroupService = async (userId, groupId) => {
  const group = await GroupChat.findById(groupId);

  if (!group) throw new Error("Group not found");

  const isAdmin = group.members.some(
    m =>
      m.userId.toString() === userId.toString() &&
      m.role === "admin" &&
      m.isActive
  );

  if (!isAdmin) throw new Error("Not authorized");

  group.isDeleted = true;

  await group.save();

  // 🔥 remove from Redis completely
  await roomStore.delete(groupId);

  return { success: true };
};