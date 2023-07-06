import express from "express";
const router = express.Router();

import userRouter from "./users.js";
import requestRouter from "./requests.js";
import authRouter from "./auth.js";

router.use("/users", userRouter);
router.use("/requests", requestRouter);
router.use("/auth", authRouter);

export default router;
