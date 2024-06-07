import { sendEmail } from "../services/emailService";
import express from "express";

const router = express.Router();

router.post("/", sendEmail);

module.exports = router;
