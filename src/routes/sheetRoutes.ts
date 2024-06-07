import { newTicket } from "../services/sheetService";
import express from "express";

const router = express.Router();

router.post("/", newTicket);

module.exports = router;
