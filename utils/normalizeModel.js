export const normalizeId = (doc) => {
  if (!doc) return null;

  const obj = doc.toJSON ? doc.toJSON() : doc;

  return {
    id: obj._id.toString(),
    ...obj,
    _id: undefined,
  };
};