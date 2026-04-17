/**
 * Set a cookie in the response
 * @param {Object} res - Express response
 * @param {string} name - cookie name
 * @param {string} value - cookie value
 * @param {number} maxAge - in seconds
 */
export const setCookie = (res, name, value, maxAge,sameSite="strict") => {
  res.cookie(name, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: sameSite,
    maxAge: maxAge * 1000, // convert seconds to milliseconds
  });
};

/**
 * Clear a cookie
 */
export const clearCookie = (res, name,sameSite="strict") => {
  res.clearCookie(name, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: sameSite,
  });
};
