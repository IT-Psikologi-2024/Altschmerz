import { verifyToken } from "../middlewares/verifyToken";
import { login, attend } from "../services/adminService";
import express from "express";

const router = express.Router();

router.post("/login", login);
router.get("/attendance/:id", verifyToken, attend);

module.exports = router;
