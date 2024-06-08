import { ticket } from "../services/ticketService";
import express from "express";
import multer from "multer";

const upload = multer();
const router = express.Router();

router.post("/", upload.any(), ticket);

module.exports = router;
