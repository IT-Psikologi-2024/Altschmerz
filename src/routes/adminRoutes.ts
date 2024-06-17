import { verifyToken } from "../middlewares/verifyTokenMiddleware";
import { login, refresh, attend } from "../services/adminService";
import express from "express";

const router = express.Router();

router.post("/login", login);
router.post("/refresh", refresh)

router.get("/attendance/:id", verifyToken, attend);

module.exports = router;
