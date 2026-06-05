import Joi from "joi";
import { mongoIdSchema, requiredMsg } from "../../../validationSchemas/general.schemas";
import { GROUP_CHAT_ROLES_ARRAY } from "../../../constants/chat.constants";

export const createGroupSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),

  description: Joi.string().allow("").max(500),

  members: Joi.array()
    .items(mongoIdSchema.required())
    .default([])
});

export const addMembersSchema = Joi.object({
  members: Joi.array()
    .items(mongoIdSchema.required())
    .min(1)
    .required()
});

export const removeMemberSchema = Joi.object({
  memberId: mongoIdSchema.required().message(requiredMsg("memberId"))
});


export const updateGroupSchema = Joi.object({
  name: Joi.string().min(3).max(100),

  description: Joi.string().allow("").max(500),

  settings: Joi.object({
    onlyAdminsCanMessage: Joi.boolean(),
    onlyAdminsCanAddMembers: Joi.boolean(),
    messageHistoryVisibleToNewMembers: Joi.boolean()
  })
}).min(1);

export const changeRoleSchema = Joi.object({
  memberId: mongoIdSchema.required().message(requiredMsg("memberId")),
  role: Joi.string().valid(...GROUP_CHAT_ROLES_ARRAY).required()
});