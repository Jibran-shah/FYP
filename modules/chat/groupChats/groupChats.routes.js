import { Router } from "express";

import {
  createGroupChat,
  getUserGroups,
  getGroupById,
  addMembers,
  removeMember,
  leaveGroup,
  updateGroupInfo,
  deleteGroup,
  changeRole
} from "./groupChats.controller.js";

import {
  createGroupSchema,
  updateGroupSchema,
  addMembersSchema,
  changeRoleSchema,
  removeMemberSchema
} from "./groupChats.validation.js"

import { protect } from "../../../middlewares/protect.middleware.js";
import { validate } from "../../../middlewares/validate.middleware.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";

const router = Router();


router.use(protect({requireBaseProfile:true}));

/*
Create group
*/
router.post(
  "/",
  validate(createGroupSchema),
  asyncHandler(createGroupChat)
);

/*
Get all groups of current user
*/
router.get(
  "/",
  asyncHandler(getUserGroups)
);

/*
Get single group details
*/
router.get(
  "/:groupId",
  asyncHandler(getGroupById)
);

/*
=====================================================
MEMBERS MANAGEMENT
=====================================================
*/

/*
Add members (admin only)
*/
router.post(
  "/:groupId/members",
  asyncHandler(addMembers)
);

/*
Remove member (admin only)
*/
router.delete(
  "/:groupId/members",
  asyncHandler(removeMember)
);

/*
Leave group (self action)
*/
router.post(
  "/:groupId/leave",
  asyncHandler(leaveGroup)
);

/*
=====================================================
GROUP SETTINGS
=====================================================
*/

/*
Update group info (name, description, settings)
*/
router.patch(
  "/:groupId",
  asyncHandler(updateGroupInfo)
);

/*
Change member role (admin/mod/member)
*/
router.patch(
  "/:groupId/members/role",
  asyncHandler(changeRole)
);

/*
=====================================================
DELETE GROUP
=====================================================
*/

/*
Delete group (admin only)
*/
router.delete(
  "/:groupId",
  asyncHandler(deleteGroup)
);

export default router;