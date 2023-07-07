import express from "express";

import {
  createUser,
  changeUserStatus,
  getUser,
  getUsers,
  updateUser,
  getSelf,
} from "../controllers/users.js";
import { verifyToken } from "../mw/verify-token.js";

const router = express.Router();

router.get("/", verifyToken, getUsers);
router.get("/:userId", verifyToken, getUser);

router.post("/create", verifyToken, createUser);

router.get("/self", verifyToken, getSelf);
router.patch("/change-status/:userId", verifyToken, changeUserStatus);
router.patch("/:userId", verifyToken, updateUser);

export default router;
