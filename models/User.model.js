import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { InternalServerError } from "../errors/index.js";

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
    enum: ["user", "admin"],
    default: "user"
  },

  isEmailVerified: {
    type: Boolean,
    default: false
  },

  profileStatus: {
    type: String,
    enum: ["INCOMPLETE", "COMPLETE"],
    default: "INCOMPLETE",
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

  this.password = await bcrypt.hash(this.password, 12);
});

export default mongoose.model(
  "User",
  userSchema
);