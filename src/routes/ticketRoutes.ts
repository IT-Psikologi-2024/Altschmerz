import { newTicket } from "../services/ticketServices";
import express from "express";

const router = express.Router();
router.post("/", newTicket);

module.exports = router;
