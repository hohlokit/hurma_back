import mongoose from "mongoose";
import createHttpError from "http-errors";

import generateId from "../utils/generate-id.js";
import userRoles from "../enums/user-roles.js";
import userStatuses from "../enums/user-statuses.js";

const user = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      default: generateId,
    },
    gender: { type: String },
    email: {
      lowercase: true,
      unique: true,
      required: true,
      type: String,
    },
    avatar: {
      type: String,
    },
    phone: {
      unique: true,
      type: String,
    },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    surname: { type: String, required: true },
    phone: String,
    birthday: {
      type: Date,
    },
    loginCode: {
      type: String,
      default: null,
    },
    balance: {
      vacation: { type: Number, default: 0 },
      sick_leave: { type: Number, default: 0 },
      overtime: { type: Number, default: 0 },
    },
    role: {
      type: String,
      enum: Object.values(userRoles),
      default: userRoles.USER,
    },
    password: {
      type: String,
    },
    status: {
      type: String,
      enum: Object.values(userStatuses),
      default: userStatuses.ACTIVE,
    },
  },
  { timestamps: true }
);

user.pre("save", async function (next) {
  const { email } = this;

  const same = await Users.findOne({
    email,
  });

  if (same)
    throw createHttpError(400, "User with provided email already exists.");

  next();
});

export const Users = mongoose.model("Users", user);
