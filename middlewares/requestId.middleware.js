import { v4 as uuid } from "uuid";

export const requestIdMiddleware = (req, res, next) => {
  req.id = uuid();
  next();
};