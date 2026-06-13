import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { InternalServerError } from "../errors/index.js";
import { USER_PROFILE_STATUS, USER_PROFILE_STATUS_ARRAY, USER_ROLES, USER_ROLES_ARRAY } from "../constants/user.constants.js";
import { AUTH_CONFIG } from "../config/auth.config.js";

const userSchema = new mongoose.Schema({
  userName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 30,
      index:true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    required: true,
    unique: true,
    match: [/^\S+@\S+\.\S+$/, "Please use a valid email"]
  },
  
  password: {
    type: String,
    required: true,
    select: false
  },

  role: {
    type: String,
    enum: USER_ROLES_ARRAY,
    default: USER_ROLES.USER
  },

  isEmailVerified: {
    type: Boolean,
    default: false
  },

  baseProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Profile",
    default: null
  },

  serviceProvider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ServiceProvider",
    default: null
  },

  productSeller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ProductSeller",
    default: null
  }},  

  { timestamps: true }
);



userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) {
    throw new InternalServerError("Password not selected in query");
  }
  return bcrypt.compare(candidatePassword, this.password);
};


userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, AUTH_CONFIG.BCRYPT.SALT_ROUNDS);
});

const User = mongoose.model.User || mongoose.model(
  "User",
  userSchema
);

export default User