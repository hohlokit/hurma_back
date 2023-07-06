import express from "express";

import { getRequests, updateRequest } from "../controllers/requests.js";
import { verifyToken } from "../mw/verify-token.js";

const router = express.Router();

router.get("/", verifyToken, getRequests);

router.patch("/:requestId", verifyToken, updateRequest);

export default router;
