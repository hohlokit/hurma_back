import mongoose from "mongoose";
import { ObjectId } from "mongodb";

import generateId from "../utils/generate-id.js";

const admin = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      default: generateId,
    },
    userId: {
      type: ObjectId,
      ref: "Users",
    },
  },
  { timestamps: true }
);

export const Admins = mongoose.model("Admins", admin);
