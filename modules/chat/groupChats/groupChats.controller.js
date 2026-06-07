import {
  createGroupService,
  getUserGroupsService,
  getGroupByIdService,
  addMembersService,
  removeMemberService,
  leaveGroupService,
  updateGroupService,
  deleteGroupService,
  changeRoleService
} from "./groupChats.service.js";

/*
=====================================================
CREATE GROUP
=====================================================
*/
export const createGroupChat = async (req, res, next) => {
  const userId = req.user.id;
  const data = req.body;
  const group = await createGroupService(userId, data);

  return res.status(201).json({
    success: true,
    message: "Group created successfully",
    data: group
  });
};

/*
=====================================================
GET USER GROUPS
=====================================================
*/
export const getUserGroups = async (req, res, next) => {
  const userId = req.user.id;

  const groups = await getUserGroupsService(userId);

  return res.status(200).json({
    success: true,
    data: groups
  });
};

/*
=====================================================
GET GROUP BY ID
=====================================================
*/
export const getGroupById = async (req, res, next) => {
  const userId = req.user.id;
  const { groupId } = req.params;

  const group = await getGroupByIdService(userId, groupId);

  return res.status(200).json({
    success: true,
    data: group
  });
};

/*
=====================================================
ADD MEMBERS
=====================================================
*/
export const addMembers = async (req, res, next) => {
  const userId = req.user.id;
  const { groupId } = req.params;
  const { members } = req.body;

  const result = await addMembersService(userId, groupId, members);

  return res.status(200).json({
    success: true,
    message: "Members added successfully",
    data: result
  });
};

/*
=====================================================
REMOVE MEMBER
=====================================================
*/
export const removeMember = async (req, res, next) => {
  const userId = req.user.id;
  const { groupId } = req.params;
  const { memberId } = req.body;

  const result = await removeMemberService(userId, groupId, memberId);

  return res.status(200).json({
    success: true,
    message: "Member removed successfully",
    data: result
  });
};

/*
=====================================================
LEAVE GROUP
=====================================================
*/
export const leaveGroup = async (req, res, next) => {
  const userId = req.user.id;
  const { groupId } = req.params;

  const result = await leaveGroupService(userId, groupId);

  return res.status(200).json({
    success: true,
    message: "Left group successfully",
    data: result
  });
};

/*
=====================================================
UPDATE GROUP
=====================================================
*/
export const updateGroupInfo = async (req, res, next) => {
  const userId = req.user.id;
  const { groupId } = req.params;
  const updates = req.body;

  const group = await updateGroupService(userId, groupId, updates);

  return res.status(200).json({
    success: true,
    message: "Group updated successfully",
    data: group
  });
};

/*
=====================================================
CHANGE ROLE
=====================================================
*/
export const changeRole = async (req, res, next) => {
  const userId = req.user.id;
  const { groupId } = req.params;
  const { memberId, role } = req.body;

  const result = await changeRoleService(userId, groupId, memberId, role);

  return res.status(200).json({
    success: true,
    message: "Role updated successfully",
    data: result
  });
};

/*
=====================================================
DELETE GROUP
=====================================================
*/
export const deleteGroup = async (req, res, next) => {
  const userId = req.user.id;
  const { groupId } = req.params;

  const result = await deleteGroupService(userId, groupId);

  return res.status(200).json({
    success: true,
    message: "Group deleted successfully",
    data: result
  });
};