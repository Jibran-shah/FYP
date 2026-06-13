import Profile from "../models/Profile.model.js"

export const syncRole = async ({
  userId,
  role,
  Model,
  session = null
}) => {
  const exists = session
    ? await Model.exists({ user: userId }).session(session)
    : await Model.exists({ user: userId });

  const update = exists
    ? { $addToSet: { role } }
    : { $pull: { role } };

  const query = Profile.findOneAndUpdate(
    { user: userId },
    update,
    { new: true }
  );

  return session
    ? await query.session(session)
    : await query;
};