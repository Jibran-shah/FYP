import ProfileModel from "../models/Profile.model.js";

export const syncRole = async ({
    userId,
    role,
    Model,
    session = null
}) => {

    const existsQuery = Model.exists({ user: userId });
    const exists = session ? await existsQuery.session(session) : await existsQuery;

    const update = exists
        ? { $addToSet: { roles: role } }
        : { $pull: { roles: role } };

    const query = ProfileModel.findOneAndUpdate(
        { user: userId },
        update
    );

    if (session) await query.session(session);
    else await query;
};