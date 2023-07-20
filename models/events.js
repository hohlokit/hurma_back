import mongoose from "mongoose";

import { ObjectId } from "mongodb";
import generateId from "../utils/generate-id.js";

const event = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      default: generateId,
    },
    banner: {
      type: String,
    },
    name: {
      type: String,
    },
    description: {
      type: String,
    },
    creators: {
      type: [ObjectId],
      ref: "Users",
      default: [],
    },
    members: {
      type: [ObjectId],
      ref: "Users",
      default: [],
    },
    startDate: Date,
    endDate: Date,
  },
  { timestamps: true }
);

export const Events = mongoose.model("Events", event);
