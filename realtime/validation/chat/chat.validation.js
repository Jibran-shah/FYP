import Joi from "joi";

/*
=====================================================
MESSAGE SEND
client → server
=====================================================
*/
export const messageSendSchema = Joi.object({
  roomId: Joi.string().hex().length(24).required(),

  content: Joi.string().allow("").max(5000).required(),

  tempId: Joi.string().min(5).max(100).required(),

  type: Joi.string()
    .valid("text", "image", "video", "audio", "file", "system")
    .default("text"),

  attachments: Joi.array()
    .items(
      Joi.object({
        mediaAssetId: Joi.string().hex().length(24).required()
      })
    )
    .default([])
});



/*
=====================================================
MESSAGE DELIVERED
client → server
=====================================================
*/
export const messageDeliveredSchema = Joi.object({
  roomId: Joi.string().hex().length(24).required(),

  messageId: Joi.string().hex().length(24).required()
});


/*
=====================================================
MESSAGE READ
client → server
=====================================================
*/
export const messageReadSchema = Joi.object({
  roomId: Joi.string().hex().length(24).required(),

  messageId: Joi.string().hex().length(24).required()
});



/*
=====================================================
TYPING START
client → server
=====================================================
*/
export const typingStartSchema = Joi.object({
  roomId: Joi.string().hex().length(24).required()
});



/*
=====================================================
TYPING STOP
client → server
=====================================================
*/
export const typingStopSchema = Joi.object({
  roomId: Joi.string().hex().length(24).required()
});


/*
=====================================================
ROOM JOIN
client → server
=====================================================
*/
export const roomJoinSchema = Joi.object({
  roomId: Joi.string().hex().length(24).required()
});


/*
=====================================================
ROOM LEAVE
client → server
=====================================================
*/
export const roomLeaveSchema = Joi.object({
  roomId: Joi.string().hex().length(24).required()
});


