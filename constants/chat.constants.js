export const GROUP_CHAT_ROLES = Object.freeze({
    ADMIN:"admin",
    MEMBER:"member"
})

export const GROUP_CHAT_ROLES_ARRAY = Object.freeze(Object.values(GROUP_CHAT_ROLES));


export const MESSAGE_CATEGORIES = Object.freeze({
    TEXT:"text",
    IMAGE:"image",
    VIDEO:"video",
    AUDIO:"audio",
    FILE:"file",
    SYSTEM:"system"
})


export const MESSAGE_STATUSES = Object.freeze({
    SENT:"sent",
    DELIVERED:"delivered",
    READ:"read",
    FAILED:"failed"
})

export const MESSAGE_STATUSES_ARRAY = Object.freeze(Object.values(MESSAGE_STATUSES));

export const MESSAGE_CATEGORIES_ARRAY = Object.freeze(Object.values(MESSAGE_CATEGORIES))