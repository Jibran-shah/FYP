import { AppError } from "../errors/index.js";

export const normalizeUserId = (id) => {
  if (!id) throw new AppError("Invalid user id");
  return String(id);
}