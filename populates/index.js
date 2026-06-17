/* =========================================================
   FILE
========================================================= */
export const filePopulate = {
  path: "file",
  select: "url"
};

/* =========================================================
   MEDIA
========================================================= */
export const mediaPopulate = {
  path: "images",
  populate: filePopulate,
};

/* =========================================================
   PROFILE AVATAR
========================================================= */
export const profileAvatarPopulate = {
  path: "profileAvatar",
  populate: filePopulate,
};

/* =========================================================
   PROFILE COVER
========================================================= */
export const profileCoverPopulate = {
  path: "profileCover",
  populate: filePopulate,
};

/* =========================================================
   NAME
========================================================= */
export const namePopulate = {
  path: "fullName",
};

/* =========================================================
   BASE PROFILE
========================================================= */
export const baseProfilePopulate = {
  path: "baseProfile",
  populate: [
    namePopulate,
    profileAvatarPopulate,
    profileCoverPopulate,
  ],
};

/* =========================================================
   USER
========================================================= */
export const userPopulate = {
  path: "user",
  populate: baseProfilePopulate,
};

/* =========================================================
   PRODUCT SELLER
========================================================= */
export const productSellerPopulate = {
  path: "seller",
  populate: userPopulate,
};

/* =========================================================
   REVIEW USER
========================================================= */
export const reviewUserPopulate = userPopulate;


export const directChatDeepPopulate = {
  path:"participants",
  populate:baseProfilePopulate
}